#!/bin/bash
# Ralph Loop - ASCII TUI with live streaming and timer

MAX=${1:-100}
SLEEP=${2:-2}
STUCK_THRESHOLD=${3:-5}

# === ЦВЕТА (ANSI) ===
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
output_file=""
tail_pid=""
timer_pid=""

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

# === ПОЛУЧИТЬ ТЕКУЩУЮ ЗАДАЧУ (ПОЛНЫЙ БЛОК) ===
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
    
    sed -n "${us_line_num},${end_line}p" PRD.md
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

# === ФУНКЦИЯ ОБНОВЛЕНИЯ ТАЙМЕРА ===
# Сохраняем позицию строки с таймером
TIMER_LINE=5

update_timer() {
    while true; do
        # Перемещаем курсор на строку с таймером и обновляем
        tput sc  # сохраняем позицию курсора
        tput cup $TIMER_LINE 0  # перемещаемся на строку таймера
        echo -ne "  Elapsed: $(get_elapsed) | Failures: $consecutive_failures/$STUCK_THRESHOLD     "
        tput rc  # восстанавливаем позицию курсора
        sleep 1
    done
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
    [[ -n "$timer_pid" ]] && kill "$timer_pid" 2>/dev/null
    [[ -n "$tail_pid" ]] && kill "$tail_pid" 2>/dev/null
    [[ -n "$claude_pid" ]] && kill "$claude_pid" 2>/dev/null
    [[ -n "$output_file" ]] && rm -f "$output_file"
    tput cnorm 2>/dev/null  # показать курсор
    echo ""
    echo "------------------------------------------------------------"
    echo "Ralph Loop interrupted"
    echo "Completed: $(count_completed) | Remaining: $(count_remaining)"
    echo "------------------------------------------------------------"
    exit 130
}
trap cleanup INT TERM EXIT

# === ГЛАВНЫЙ ЦИКЛ ===
while true; do
    ((iteration++))
    
    remaining=$(count_remaining)
    completed=$(count_completed)
    total=$((completed + remaining))
    
    # Останавливаем предыдущий таймер
    [[ -n "$timer_pid" ]] && kill "$timer_pid" 2>/dev/null
    timer_pid=""
    
    # Все задачи выполнены?
    if [[ "$remaining" -eq 0 ]] || [[ -z "$remaining" ]]; then
        echo ""
        echo -e "${GREEN}============================================${NC}"
        echo -e "${GREEN}  ALL TASKS COMPLETE!${NC}"
        echo -e "${GREEN}============================================${NC}"
        echo "Total iterations: $iteration"
        echo "Time: $(get_elapsed)"
        echo "Completed: $completed tasks"
        exit 0
    fi

    # Лимит итераций?
    if [[ $MAX -ne 0 && $iteration -gt $MAX ]]; then
        echo ""
        echo -e "${YELLOW}============================================${NC}"
        echo -e "${YELLOW}  Reached max iterations ($MAX)${NC}"
        echo -e "${YELLOW}============================================${NC}"
        echo "Completed: $completed | Remaining: $remaining"
        echo "To continue: ./ralph.sh $MAX $SLEEP $STUCK_THRESHOLD"
        exit 1
    fi

    # === HEADER ===
    clear
    tput civis  # скрыть курсор
    
    echo "============================================================"
    echo "  RALPH LOOP - Iteration $iteration / $([ $MAX -eq 0 ] && echo 'unlimited' || echo $MAX)"
    echo "============================================================"
    echo ""
    echo -n "  Progress: "
    progress_bar "$completed" "$total"
    echo ""
    # Строка 5 (TIMER_LINE) - здесь будет обновляться время
    echo "  Elapsed: $(get_elapsed) | Failures: $consecutive_failures/$STUCK_THRESHOLD     "
    echo ""
    
    # === ТЕКУЩАЯ ЗАДАЧА ИЗ PRD ===
    echo "------------------------------------------------------------"
    echo "  CURRENT TASK FROM PRD.md"
    echo "------------------------------------------------------------"
    echo ""
    get_current_task_block | head -20 | while IFS= read -r line; do
        echo "  $line"
    done
    echo ""
    
    # === GIT COMMITS ===
    echo "------------------------------------------------------------"
    echo "  RECENT GIT COMMITS"
    echo "------------------------------------------------------------"
    if git rev-parse --git-dir > /dev/null 2>&1; then
        commits=$(git log --oneline -3 2>/dev/null)
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
    
    # === CLAUDE OUTPUT ===
    echo "------------------------------------------------------------"
    echo "  CLAUDE OUTPUT (live)"
    echo "------------------------------------------------------------"

    # Запускаем обновление таймера в фоне
    update_timer &
    timer_pid=$!

    # Создаем файл для вывода
    output_file=$(mktemp)
    touch "$output_file"
    
    # Запускаем tail -f в фоне для стриминга
    tail -f "$output_file" 2>/dev/null | while IFS= read -r line; do
        echo "  ${line:0:76}"
    done &
    tail_pid=$!
    
    # Запускаем Claude
    claude --dangerously-skip-permissions -p "$PROMPT_TEMPLATE" >> "$output_file" 2>&1
    exit_code=$?
    
    # Даем tail показать последний вывод
    sleep 0.5
    
    # Останавливаем tail и таймер
    kill "$tail_pid" 2>/dev/null
    wait "$tail_pid" 2>/dev/null
    tail_pid=""
    
    kill "$timer_pid" 2>/dev/null
    wait "$timer_pid" 2>/dev/null
    timer_pid=""
    
    tput cnorm  # показать курсор
    
    # Читаем результат
    result=$(cat "$output_file" 2>/dev/null)
    rm -f "$output_file"
    output_file=""

    echo ""
    echo "------------------------------------------------------------"

    # Ошибка Claude?
    if [[ $exit_code -ne 0 ]] || [[ -z "$result" ]]; then
        echo -e "  ${YELLOW}[!] Claude error or empty response, retrying...${NC}"
        sleep "$SLEEP"
        continue
    fi

    # Все выполнено?
    if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
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
        consecutive_failures=0
    elif [[ "$result" == *"<r>FAILED</r>"* ]]; then
        ((consecutive_failures++))
        echo -e "  ${RED}[FAIL] Task failed (attempt $consecutive_failures/$STUCK_THRESHOLD)${NC}"
        
        if [[ $consecutive_failures -ge $STUCK_THRESHOLD ]]; then
            echo ""
            echo -e "${RED}============================================${NC}"
            echo -e "${RED}  STUCK: $STUCK_THRESHOLD consecutive failures${NC}"
            echo -e "${RED}============================================${NC}"
            echo ""
            echo "Check progress.txt for details"
            echo "Fix manually, then: ./ralph.sh $MAX $SLEEP $STUCK_THRESHOLD"
            exit 2
        fi
    else
        echo -e "  ${YELLOW}[?] No status tag found${NC}"
    fi

    echo ""
    echo "  Next iteration in ${SLEEP}s... (Ctrl+C to stop)"
    echo "============================================================"
    sleep "$SLEEP"
done
