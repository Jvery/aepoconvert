#!/bin/bash
# Ralph Loop - запускает Claude Code напрямую, показывает его интерфейс
# Статус определяется по изменениям в PRD.md

MAX=${1:-100}
SLEEP=${2:-2}
STUCK_THRESHOLD=${3:-5}

# === ЦВЕТА ===
RED='\e[31m'
GREEN='\e[32m'
YELLOW='\e[33m'
CYAN='\e[36m'
BOLD='\e[1m'
DIM='\e[2m'
NC='\e[0m'

# === ПЕРЕМЕННЫЕ ===
iteration=0
consecutive_failures=0
start_time=$(date +%s)

# === PROMPT ===
read -r -d '' PROMPT_TEMPLATE << 'PROMPT_END'
You are Ralph, an autonomous coding agent. Execute exactly ONE task per iteration.

## Your Algorithm

1. **Read PRD.md** - find the FIRST uncompleted criterion (marked [ ])
2. **Read progress.txt** - check Learnings section for patterns
3. **Implement that ONE criterion only**
4. **Run verification** - typecheck, tests, or browser check as specified
5. **Update files and commit**

## If Tests PASS

1. Update PRD.md: change [ ] to [x] for the completed criterion
2. Commit: git add -A && git commit -m "feat: [criterion description]"
3. Append to progress.txt what was done

## If Tests FAIL

1. Do NOT mark criterion as complete
2. Do NOT commit broken code  
3. Append to progress.txt what went wrong
PROMPT_END

# === ФУНКЦИИ ===
count_remaining() {
    grep -c '^\- \[ \]' PRD.md 2>/dev/null | grep -oE '[0-9]+' | head -1 || echo "0"
}

count_completed() {
    grep -c '^\- \[x\]' PRD.md 2>/dev/null | grep -oE '[0-9]+' | head -1 || echo "0"
}

get_elapsed() {
    local now=$(date +%s)
    local diff=$((now - start_time))
    printf "%02d:%02d:%02d" $((diff/3600)) $(((diff%3600)/60)) $((diff%60))
}

# Получить текущую User Story и критерии с маркерами
get_current_task_block() {
    local first_incomplete_line=$(grep -n '^\- \[ \]' PRD.md 2>/dev/null | head -1 | cut -d: -f1)
    
    if [[ -z "$first_incomplete_line" ]]; then
        echo "No pending tasks"
        return
    fi
    
    local us_line=$(head -n "$first_incomplete_line" PRD.md | grep -n '^### US-' | tail -1)
    local us_line_num=$(echo "$us_line" | cut -d: -f1)
    
    if [[ -z "$us_line_num" ]]; then
        echo "No User Story found"
        return
    fi
    
    local total_lines=$(wc -l < PRD.md)
    local next_section=$(tail -n +$((us_line_num + 1)) PRD.md | grep -n '^### \|^## ' | head -1 | cut -d: -f1)
    
    local end_line
    if [[ -n "$next_section" ]]; then
        end_line=$((us_line_num + next_section - 1))
    else
        end_line=$total_lines
    fi
    
    # Выводим с цветовыми маркерами используя awk
    sed -n "${us_line_num},${end_line}p" PRD.md | awk '
    BEGIN { found_current = 0 }
    /^- \[x\]/ { 
        print "\033[32m" $0 "  <-- DONE\033[0m"
        next 
    }
    /^- \[ \]/ { 
        if (found_current == 0) {
            print "\033[1;33m" $0 "  <-- CURRENT\033[0m"
            found_current = 1
        } else {
            print "\033[2m" $0 "\033[0m"
        }
        next
    }
    { print }
    '
}

progress_bar() {
    local done=$1
    local total=$2
    local width=40
    
    if [[ $total -eq 0 ]]; then
        printf "[%-${width}s] 0/0 (0%%)" ""
        return
    fi
    
    local pct=$((done * 100 / total))
    local filled=$((done * width / total))
    local empty=$((width - filled))
    
    printf "["
    for ((i=0; i<filled; i++)); do printf "#"; done
    for ((i=0; i<empty; i++)); do printf "-"; done
    printf "] %d/%d (%d%%)" "$done" "$total" "$pct"
}

show_header() {
    local remaining=$(count_remaining)
    local completed=$(count_completed)
    local total=$((completed + remaining))
    
    echo ""
    echo "================================================================"
    echo -e "  ${BOLD}RALPH LOOP${NC} - Iteration $iteration"
    echo "================================================================"
    echo ""
    echo -n "  Progress: "
    progress_bar "$completed" "$total"
    echo ""
    echo "  Elapsed: $(get_elapsed) | Failures: $consecutive_failures/$STUCK_THRESHOLD"
    echo ""
    echo "----------------------------------------------------------------"
    echo "  CURRENT TASK"
    echo "----------------------------------------------------------------"
    get_current_task_block | while IFS= read -r line; do
        echo -e "  $line"
    done
    echo ""
    echo "----------------------------------------------------------------"
    echo "  GIT LOG (last 3 commits)"
    echo "----------------------------------------------------------------"
    if git rev-parse --git-dir > /dev/null 2>&1; then
        local commits=$(git log --oneline -3 2>/dev/null)
        if [[ -n "$commits" ]]; then
            echo "$commits" | while read -r line; do
                echo "  $line"
            done
        else
            echo "  (no commits yet)"
        fi
    else
        echo "  (not a git repository)"
    fi
    echo ""
    echo "================================================================"
    echo -e "  ${CYAN}CLAUDE CODE OUTPUT${NC} (below)"
    echo "================================================================"
    echo ""
}

# === ПРОВЕРКА ФАЙЛОВ ===
if [[ ! -f "PRD.md" ]]; then
    echo -e "${RED}ERROR: PRD.md not found!${NC}"
    exit 1
fi

if [[ ! -f "progress.txt" ]]; then
    cat > progress.txt << 'EOF'
# Progress Log

## Learnings

---
EOF
fi

# === TRAP ===
cleanup() {
    echo ""
    echo "----------------------------------------------------------------"
    echo "Ralph Loop interrupted"
    echo "Completed: $(count_completed) | Remaining: $(count_remaining)"
    echo "Time: $(get_elapsed)"
    echo "----------------------------------------------------------------"
    exit 130
}
trap cleanup INT TERM

# === ГЛАВНЫЙ ЦИКЛ ===
while true; do
    ((iteration++))
    
    # Считаем до запуска Claude
    remaining_before=$(count_remaining)
    completed_before=$(count_completed)
    
    # Все задачи выполнены?
    if [[ "$remaining_before" -eq 0 ]] || [[ -z "$remaining_before" ]]; then
        echo ""
        echo -e "${GREEN}================================================================${NC}"
        echo -e "${GREEN}  ALL TASKS COMPLETE!${NC}"
        echo -e "${GREEN}================================================================${NC}"
        echo "  Total iterations: $iteration"
        echo "  Time: $(get_elapsed)"
        echo "  Completed: $completed_before tasks"
        exit 0
    fi

    # Лимит итераций?
    if [[ $MAX -ne 0 && $iteration -gt $MAX ]]; then
        echo ""
        echo -e "${YELLOW}================================================================${NC}"
        echo -e "${YELLOW}  Reached max iterations ($MAX)${NC}"
        echo -e "${YELLOW}================================================================${NC}"
        echo "  Completed: $completed_before | Remaining: $remaining_before"
        echo "  To continue: ./ralph.sh $MAX $SLEEP $STUCK_THRESHOLD"
        exit 1
    fi

    # Показываем header
    show_header
    
    # Запускаем Claude напрямую (он покажет свой UI)
    claude --dangerously-skip-permissions -p "$PROMPT_TEMPLATE"
    claude_exit_code=$?
    
    echo ""
    echo "================================================================"
    
    # Считаем после Claude
    remaining_after=$(count_remaining)
    completed_after=$(count_completed)
    
    # Определяем статус по изменениям в PRD.md
    if [[ $claude_exit_code -ne 0 ]]; then
        echo -e "  ${RED}[ERROR] Claude exited with code $claude_exit_code${NC}"
        ((consecutive_failures++))
    elif [[ "$completed_after" -gt "$completed_before" ]]; then
        echo -e "  ${GREEN}[OK] Task completed! ($completed_before -> $completed_after)${NC}"
        consecutive_failures=0
    elif [[ "$remaining_after" -lt "$remaining_before" ]]; then
        echo -e "  ${GREEN}[OK] Progress made!${NC}"
        consecutive_failures=0
    else
        echo -e "  ${YELLOW}[?] No progress detected${NC}"
        ((consecutive_failures++))
    fi
    
    echo "  Elapsed: $(get_elapsed)"
    echo "================================================================"
    
    # Проверяем stuck
    if [[ $consecutive_failures -ge $STUCK_THRESHOLD ]]; then
        echo ""
        echo -e "${RED}================================================================${NC}"
        echo -e "${RED}  STUCK: $STUCK_THRESHOLD consecutive failures${NC}"
        echo -e "${RED}================================================================${NC}"
        echo "  Check progress.txt for details"
        echo "  Fix manually, then: ./ralph.sh $MAX $SLEEP $STUCK_THRESHOLD"
        exit 2
    fi
    
    # Все выполнено?
    if [[ "$remaining_after" -eq 0 ]]; then
        echo ""
        echo -e "${GREEN}================================================================${NC}"
        echo -e "${GREEN}  ALL TASKS COMPLETE!${NC}"
        echo -e "${GREEN}================================================================${NC}"
        echo "  Iterations: $iteration | Time: $(get_elapsed)"
        exit 0
    fi
    
    echo ""
    echo "  Next iteration in ${SLEEP}s... (Ctrl+C to stop)"
    sleep "$SLEEP"
done
