#!/bin/bash
# НЕ используем set -e — обрабатываем ошибки вручную, чтобы цикл не прерывался

MAX=${1:-100}                    # Лимит итераций (0 = бесконечно)
SLEEP=${2:-2}                    # Пауза между итерациями
STUCK_THRESHOLD=${3:-5}          # Сколько FAILED подряд = stuck

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Счётчики
iteration=0
consecutive_failures=0

# Функция подсчёта оставшихся задач (незавершённых чекбоксов)
count_remaining() {
    local count
    count=$(grep -cE '^\- \[ \]' PRD.md 2>/dev/null | tr -d '[:space:]')
    if [[ -z "$count" || ! "$count" =~ ^[0-9]+$ ]]; then
        echo "0"
    else
        echo "$count"
    fi
}

# Функция подсчёта выполненных задач
count_completed() {
    local count
    count=$(grep -cE '^\- \[x\]' PRD.md 2>/dev/null | tr -d '[:space:]')
    if [[ -z "$count" || ! "$count" =~ ^[0-9]+$ ]]; then
        echo "0"
    else
        echo "$count"
    fi
}

# Функция получения текущей задачи (первой невыполненной)
get_current_task() {
    local task_line
    task_line=$(grep -B 20 '^\- \[ \]' PRD.md 2>/dev/null | grep -E '^### US-[0-9]+' | tail -1)
    if [[ -n "$task_line" ]]; then
        echo "$task_line" | sed 's/### //'
    else
        echo "Unknown task"
    fi
}

# Функция отображения прогресс-бара
show_progress() {
    local completed=$1
    local total=$2
    local width=30
    
    if [[ $total -eq 0 ]]; then
        echo "No tasks found in PRD.md"
        return
    fi
    
    local percent=$((completed * 100 / total))
    local filled=$((completed * width / total))
    local empty=$((width - filled))
    
    printf "${CYAN}Progress: ${NC}["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] ${BOLD}%d/%d${NC} (${GREEN}%d%%${NC})\n" "$completed" "$total" "$percent"
}

# Проверка наличия файлов
if [[ ! -f "PRD.md" ]]; then
    echo -e "${RED}❌ ERROR: PRD.md not found!${NC}"
    exit 1
fi

if [[ ! -f "progress.txt" ]]; then
    echo -e "${YELLOW}⚠️  Creating empty progress.txt${NC}"
    echo -e "# Progress Log\n\n## Learnings\n\n---" > progress.txt
fi

# Начальный вывод
clear
echo -e "${BOLD}🚀 RALPH LOOP${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Max iterations: ${CYAN}$([ "$MAX" -eq 0 ] && echo "unlimited" || echo "$MAX")${NC}"
echo -e "Stuck threshold: ${CYAN}$STUCK_THRESHOLD${NC} consecutive failures"
echo ""

completed_init=$(count_completed)
remaining_init=$(count_remaining)
total_tasks=$((completed_init + remaining_init))

echo -e "Found: ${CYAN}$remaining_init${NC} remaining, ${CYAN}$completed_init${NC} completed"
show_progress "$completed_init" "$total_tasks"
echo ""

# Главный цикл — продолжаем пока есть незавершённые задачи
while true; do
    ((iteration++))
    
    remaining=$(count_remaining)
    completed=$(count_completed)
    total=$((completed + remaining))
    current_task=$(get_current_task)
    
    # Проверка: все задачи уже выполнены?
    if [[ "$remaining" -eq 0 ]]; then
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  ✅ ALL TASKS COMPLETE!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        show_progress "$completed" "$total"
        echo -e "Total iterations: ${CYAN}$iteration${NC}"
        echo ""
        exit 0
    fi

    # Проверка лимита итераций (если не 0)
    if [[ $MAX -ne 0 && $iteration -gt $MAX ]]; then
        echo ""
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}  ⚠️  REACHED MAX ITERATIONS ($MAX)${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        show_progress "$completed" "$total"
        echo -e "To continue: ${CYAN}./ralph.sh $MAX $SLEEP $STUCK_THRESHOLD${NC}"
        echo ""
        exit 1
    fi

    # Заголовок итерации
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  ITERATION $iteration$([ "$MAX" -ne 0 ] && echo " of $MAX")${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    show_progress "$completed" "$total"
    echo ""
    echo -e "${BOLD}📌 Current task:${NC} ${CYAN}$current_task${NC}"
    echo ""
    echo -e "${BOLD}🤖 Claude is working...${NC}"
    echo "───────────────────────────────────────────"

    # Запуск Claude
    result=$(claude --dangerously-skip-permissions -p "You are Ralph, an autonomous coding agent. Execute exactly ONE task per iteration.

## Your Algorithm

1. **Read PRD.md** — find the FIRST task marked [ ] (uncompleted)
2. **Read progress.txt** — check Learnings section for patterns from previous iterations
3. **Implement that ONE task only** — no more, no less
4. **Run verification** — typecheck, tests, or manual check as specified
5. **Complete the iteration** (see rules below)

## Required Tools

- **For UI/Frontend tasks:** ALWAYS read and follow \`/mnt/skills/public/frontend-design/SKILL.md\` before implementing
- **For E2E tests:** Use Playwright (\`npx playwright test\`)

## If Tests PASS ✅

1. Update PRD.md: change [ ] to [x] for the completed task
2. Commit: git commit -m 'feat: [task description]'
3. Append to progress.txt what was done and learnings
4. Output exactly: <r>SUCCESS</r>

## If Tests FAIL ❌

1. Do NOT mark task as complete
2. Do NOT commit broken code
3. Append to progress.txt what went wrong and possible fix
4. Output exactly: <r>FAILED</r>

## AGENTS.md (Optional)

If you discover a reusable pattern, add it to AGENTS.md

## End Condition

After completing your task, check PRD.md:
- If ALL tasks are [x] → output: <promise>COMPLETE</promise>
- Otherwise → output <r>SUCCESS</r> or <r>FAILED</r>" 2>&1)
    
    exit_code=$?

    echo "$result"
    echo "───────────────────────────────────────────"

    # Обработка ошибки Claude CLI — НЕ прерываем цикл
    if [[ $exit_code -ne 0 ]]; then
        echo -e "${YELLOW}⚠️  Claude CLI error (exit code: $exit_code), retrying...${NC}"
        sleep "$SLEEP"
        continue
    fi

    # Обработка пустого ответа — НЕ прерываем цикл
    if [[ -z "$result" ]]; then
        echo -e "${YELLOW}⚠️  Empty response, retrying...${NC}"
        sleep "$SLEEP"
        continue
    fi

    # Проверка: все задачи выполнены
    if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
        completed=$(count_completed)
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  ✅ ALL TASKS COMPLETE!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        show_progress "$completed" "$completed"
        echo -e "Total iterations: ${CYAN}$iteration${NC}"
        echo ""
        exit 0
    fi

    # Статус итерации
    if [[ "$result" == *"<r>SUCCESS</r>"* ]]; then
        echo -e "${GREEN}✅ Task completed successfully${NC}"
        consecutive_failures=0
    elif [[ "$result" == *"<r>FAILED</r>"* ]]; then
        ((consecutive_failures++))
        echo -e "${RED}❌ Task failed${NC} (attempt $consecutive_failures of $STUCK_THRESHOLD)"
        
        if [[ $consecutive_failures -ge $STUCK_THRESHOLD ]]; then
            echo ""
            echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${RED}  🛑 STUCK: $STUCK_THRESHOLD consecutive failures${NC}"
            echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "Last task: ${CYAN}$current_task${NC}"
            echo -e "Check ${CYAN}progress.txt${NC} for error details"
            echo -e "Fix manually, then: ${CYAN}./ralph.sh $MAX $SLEEP $STUCK_THRESHOLD${NC}"
            echo ""
            exit 2
        fi
    else
        echo -e "${YELLOW}⚠️  No status tag found in response${NC}"
    fi

    sleep "$SLEEP"
done
