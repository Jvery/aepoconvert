#!/bin/bash
# Ralph Loop - ASCII TUI with live streaming

MAX=${1:-100}
SLEEP=${2:-2}
STUCK_THRESHOLD=${3:-5}

# === ЦВЕТА (ANSI) ===
RED='\e[31m'
GREEN='\e[32m'
YELLOW='\e[33m'
BLUE='\e[34m'
CYAN='\e[36m'
BOLD='\e[1m'
DIM='\e[2m'
NC='\e[0m'

# === ПЕРЕМЕННЫЕ ===
iteration=0
consecutive_failures=0
current_us=""
current_criterion=""
last_status="starting"
start_time=$(date +%s)

# === PROMPT TEMPLATE ===
PROMPT_TEMPLATE='You are Ralph, an autonomous coding agent. Execute exactly ONE task per iteration.

## Your Algorithm

1. **Read PRD.md** - find the FIRST uncompleted criterion (marked [ ])
2. **Read progress.txt** - check Learnings section for patterns
3. **Implement that ONE criterion only**
4. **Run verification** - typecheck, tests, or browser check as specified
5. **Complete the iteration** (see rules below)

## Required Tools

- **For UI/Frontend tasks:** Read `/mnt/skills/public/frontend-design/SKILL.md` first
- **For E2E tests:** Use Playwright

## If Tests PASS

1. Update PRD.md: change [ ] to [x] for the completed criterion
2. Commit: git add -A && git commit -m "feat: [criterion description]"
3. Append to progress.txt what was done
4. Output exactly: <r>SUCCESS</r>

## If Tests FAIL

1. Do NOT mark criterion as complete
2. Do NOT commit broken code
3. Append to progress.txt what went wrong
4. Output exactly: <r>FAILED</r>

## End Condition

After completing, check PRD.md:
- If ALL criteria are [x] -> output: <promise>COMPLETE</promise>
- Otherwise -> output <r>SUCCESS</r> or <r>FAILED</r>'

# === ФУНКЦИИ ПОДСЧЕТА ===
count_remaining() {
    local count
    count=$(grep -c '^\- \[ \]' PRD.md 2>/dev/null || echo "0")
    echo "$count" | grep -oE '^[0-9]+' | head -1 || echo "0"
}

count_completed() {
    local count
    count=$(grep -c '^\- \[x\]' PRD.md 2>/dev/null || echo "0")
    echo "$count" | grep -oE '^[0-9]+' | head -1 || echo "0"
}

get_current_us() {
    local us_line=""
    while IFS= read -r line; do
        if [[ "$line" =~ ^###[[:space:]]+(US-[0-9]+.*) ]]; then
            us_line="${BASH_REMATCH[1]}"
        fi
        if [[ "$line" =~ ^-[[:space:]]\[[[:space:]]\] ]] && [[ -n "$us_line" ]]; then
            echo "$us_line"
            return
        fi
    done < PRD.md
    echo "No pending tasks"
}

get_current_criterion() {
    grep -m1 '^\- \[ \]' PRD.md 2>/dev/null | sed 's/^- \[ \] //' || echo "None"
}

get_elapsed() {
    local now=$(($(date +%s)))
    local diff=$((now - start_time))
    printf "%02d:%02d:%02d" $((diff/3600)) $(((diff%3600)/60)) $((diff%60))
}

# === ПРОГРЕСС БАР (ASCII) ===
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

# === ОТРИСОВКА HEADER ===
draw_header() {
    clear
    
    local completed=$(count_completed)
    local remaining=$(count_remaining)
    local total=$((completed + remaining))
    
    echo "============================================================"
    echo "  RALPH LOOP"
    echo "============================================================"
    echo ""
    echo "  Iteration:  $iteration / $([ $MAX -eq 0 ] && echo 'unlimited' || echo $MAX)"
    echo "  Elapsed:    $(get_elapsed)"
    echo "  Failures:   $consecutive_failures / $STUCK_THRESHOLD"
    echo ""
    echo "------------------------------------------------------------"
    echo "  PROGRESS"
    echo "------------------------------------------------------------"
    echo -n "  "
    progress_bar "$completed" "$total"
    echo ""
    echo ""
    echo "------------------------------------------------------------"
    echo "  CURRENT USER STORY"
    echo "------------------------------------------------------------"
    echo -e "  ${CYAN}${current_us}${NC}"
    echo ""
    echo "  Next criterion:"
    echo -e "  ${DIM}${current_criterion}${NC}"
    echo ""
    echo "------------------------------------------------------------"
    echo "  STATUS"
    echo "------------------------------------------------------------"
    case "$last_status" in
        "working")
            echo -e "  ${YELLOW}[...] Claude is working${NC}"
            ;;
        "success")
            echo -e "  ${GREEN}[OK]  Task completed successfully${NC}"
            ;;
        "failed")
            echo -e "  ${RED}[FAIL] Task failed (attempt $consecutive_failures/$STUCK_THRESHOLD)${NC}"
            ;;
        "retrying")
            echo -e "  ${YELLOW}[...] Retrying...${NC}"
            ;;
        "complete")
            echo -e "  ${GREEN}[DONE] All tasks complete!${NC}"
            ;;
        "stuck")
            echo -e "  ${RED}[STUCK] Manual intervention required${NC}"
            ;;
        *)
            echo -e "  ${DIM}Starting...${NC}"
            ;;
    esac
    echo ""
    echo "------------------------------------------------------------"
    echo "  RECENT GIT COMMITS"
    echo "------------------------------------------------------------"
    if git log --oneline -3 2>/dev/null | head -3 | while read -r line; do
        echo "  $line"
    done; then
        :
    else
        echo "  (no commits yet)"
    fi
    echo ""
    echo "------------------------------------------------------------"
    echo "  PROMPT SENT TO CLAUDE"
    echo "------------------------------------------------------------"
    echo -e "  ${DIM}(First 5 lines of prompt)${NC}"
    echo "$PROMPT_TEMPLATE" | head -5 | while IFS= read -r line; do
        echo "  ${line:0:60}"
    done
    echo "  ..."
    echo ""
    echo "------------------------------------------------------------"
    echo "  CLAUDE OUTPUT (streaming)"
    echo "------------------------------------------------------------"
}

# === ПРОВЕРКА ФАЙЛОВ ===
if [[ ! -f "PRD.md" ]]; then
    echo "ERROR: PRD.md not found!"
    exit 1
fi

if [[ ! -f "progress.txt" ]]; then
    cat > progress.txt << 'EOF'
# Progress Log

## Learnings

---
EOF
fi

# === TRAP ДЛЯ CTRL+C ===
cleanup() {
    echo ""
    echo ""
    echo "------------------------------------------------------------"
    echo "Ralph Loop interrupted"
    echo "Completed: $(count_completed) | Remaining: $(count_remaining)"
    echo "------------------------------------------------------------"
    exit 130
}
trap cleanup INT TERM

# === ГЛАВНЫЙ ЦИКЛ ===
while true; do
    ((iteration++))
    
    remaining=$(count_remaining)
    completed=$(count_completed)
    current_us=$(get_current_us)
    current_criterion=$(get_current_criterion)
    
    # Все задачи выполнены?
    if [[ "$remaining" -eq 0 ]] || [[ -z "$remaining" ]]; then
        last_status="complete"
        draw_header
        echo ""
        echo -e "${GREEN}============================================${NC}"
        echo -e "${GREEN}  ALL TASKS COMPLETE!${NC}"
        echo -e "${GREEN}============================================${NC}"
        echo "Total iterations: $iteration"
        echo "Time: $(get_elapsed)"
        exit 0
    fi

    # Лимит итераций?
    if [[ $MAX -ne 0 && $iteration -gt $MAX ]]; then
        draw_header
        echo ""
        echo -e "${YELLOW}============================================${NC}"
        echo -e "${YELLOW}  Reached max iterations ($MAX)${NC}"
        echo -e "${YELLOW}============================================${NC}"
        echo "Completed: $completed | Remaining: $remaining"
        echo "To continue: ./ralph.sh $MAX $SLEEP $STUCK_THRESHOLD"
        exit 1
    fi

    last_status="working"
    draw_header

    # === ЗАПУСК CLAUDE СО СТРИМИНГОМ ===
    # Используем tee для одновременного показа и сохранения
    output_file=$(mktemp)
    
    echo -e "  ${DIM}>>> Starting Claude...${NC}"
    echo ""
    
    # Запускаем claude и показываем вывод в реальном времени
    # Используем script для захвата unbuffered output или просто tee
    {
        claude --dangerously-skip-permissions -p "$PROMPT_TEMPLATE" 2>&1
    } | tee "$output_file" | while IFS= read -r line; do
        # Показываем каждую строку с отступом
        echo "  ${line:0:70}"
    done
    
    exit_code=${PIPESTATUS[0]}
    
    result=$(cat "$output_file" 2>/dev/null)
    rm -f "$output_file"

    echo ""
    echo "------------------------------------------------------------"

    # Ошибка Claude?
    if [[ $exit_code -ne 0 ]] || [[ -z "$result" ]]; then
        echo -e "  ${YELLOW}Claude error or empty response, retrying...${NC}"
        last_status="retrying"
        sleep "$SLEEP"
        continue
    fi

    # Все выполнено?
    if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
        last_status="complete"
        echo ""
        echo -e "${GREEN}============================================${NC}"
        echo -e "${GREEN}  ALL TASKS COMPLETE!${NC}"
        echo -e "${GREEN}============================================${NC}"
        echo "Iterations: $iteration | Time: $(get_elapsed)"
        exit 0
    fi

    # Проверка статуса
    if [[ "$result" == *"<r>SUCCESS</r>"* ]]; then
        echo -e "  ${GREEN}[OK] Task completed successfully${NC}"
        last_status="success"
        consecutive_failures=0
    elif [[ "$result" == *"<r>FAILED</r>"* ]]; then
        ((consecutive_failures++))
        echo -e "  ${RED}[FAIL] Task failed (attempt $consecutive_failures/$STUCK_THRESHOLD)${NC}"
        last_status="failed"
        
        if [[ $consecutive_failures -ge $STUCK_THRESHOLD ]]; then
            last_status="stuck"
            echo ""
            echo -e "${RED}============================================${NC}"
            echo -e "${RED}  STUCK: $STUCK_THRESHOLD consecutive failures${NC}"
            echo -e "${RED}============================================${NC}"
            echo "Task: $current_us"
            echo "Criterion: $current_criterion"
            echo "Check progress.txt for details"
            echo "Fix manually, then: ./ralph.sh $MAX $SLEEP $STUCK_THRESHOLD"
            exit 2
        fi
    else
        echo -e "  ${YELLOW}[?] No status tag found${NC}"
    fi

    echo ""
    echo "  Sleeping ${SLEEP}s before next iteration..."
    echo "============================================================"
    sleep "$SLEEP"
done
