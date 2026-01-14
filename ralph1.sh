#!/bin/bash
# Ralph Loop v2.0 - Beautiful Terminal UI for Autonomous Coding Agent
# Features: Unicode UI, animated spinners, live timer, JSON output parsing
# Follows CLI UX best practices from clig.dev and Evil Martians

set -uo pipefail

# === CONFIGURATION ===
MAX=${1:-100}
SLEEP=${2:-2}
STUCK_THRESHOLD=${3:-5}

# === COLOR DETECTION (respect NO_COLOR, TERM=dumb, non-TTY) ===
use_color() {
    [[ -z "${NO_COLOR:-}" ]] && [[ "${TERM:-}" != "dumb" ]] && [[ -t 1 ]]
}

if use_color; then
    # Modern color palette
    RED=$'\e[38;5;203m'
    GREEN=$'\e[38;5;114m'
    YELLOW=$'\e[38;5;221m'
    BLUE=$'\e[38;5;111m'
    CYAN=$'\e[38;5;117m'
    MAGENTA=$'\e[38;5;183m'
    GRAY=$'\e[38;5;245m'
    WHITE=$'\e[38;5;255m'
    BOLD=$'\e[1m'
    DIM=$'\e[2m'
    ITALIC=$'\e[3m'
    NC=$'\e[0m'
    # Status icons
    ICON_OK=$'\e[38;5;114m\e[0m'
    ICON_FAIL=$'\e[38;5;203m\e[0m'
    ICON_WARN=$'\e[38;5;221m\e[0m'
    ICON_WORK=$'\e[38;5;117m\e[0m'
    ICON_TIME=$'\e[38;5;183m\e[0m'
else
    RED='' GREEN='' YELLOW='' BLUE='' CYAN='' MAGENTA='' GRAY='' WHITE=''
    BOLD='' DIM='' ITALIC='' NC=''
    ICON_OK='[OK]' ICON_FAIL='[X]' ICON_WARN='[!]' ICON_WORK='[>]' ICON_TIME='[T]'
fi

# === UNICODE BOX DRAWING ===
BOX_TL='╭' BOX_TR='╮' BOX_BL='╰' BOX_BR='╯'
BOX_H='─' BOX_V='│'
BOX_LT='├' BOX_RT='┤' BOX_TT='┬' BOX_BT='┴' BOX_X='┼'

# === SPINNER FRAMES (Braille animation) ===
SPINNER_FRAMES=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
SPINNER_IDX=0

# === STATE VARIABLES ===
iteration=0
consecutive_failures=0
start_time=$(date +%s)
term_width=$(tput cols 2>/dev/null || echo 80)

# === PROMPT TEMPLATE ===
read -r -d '' PROMPT_TEMPLATE << 'PROMPT_END' || true
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

# === UTILITY FUNCTIONS ===

# Get terminal width (refresh on each call for resize support)
get_width() {
    tput cols 2>/dev/null || echo 80
}

# Draw horizontal line
draw_line() {
    local width=${1:-$(get_width)}
    local char=${2:-$BOX_H}
    printf '%*s' "$width" '' | tr ' ' "$char"
}

# Draw box line with optional content
box_line() {
    local content="$1"
    local width=$(get_width)
    local inner=$((width - 4))
    local stripped
    stripped=$(echo -e "$content" | sed 's/\x1b\[[0-9;]*m//g')
    local len=${#stripped}
    local pad=$((inner - len))
    [[ $pad -lt 0 ]] && pad=0
    printf "${GRAY}${BOX_V}${NC} %s%*s ${GRAY}${BOX_V}${NC}\n" "$content" "$pad" ""
}

# Draw box top
box_top() {
    local title="$1"
    local width=$(get_width)
    local inner=$((width - 4))
    local stripped
    stripped=$(echo -e "$title" | sed 's/\x1b\[[0-9;]*m//g')
    local tlen=${#stripped}
    local side=$(( (inner - tlen - 2) / 2 ))
    [[ $side -lt 1 ]] && side=1
    printf "${GRAY}${BOX_TL}"
    draw_line "$side"
    printf "${NC} %s ${GRAY}" "$title"
    draw_line "$((inner - side - tlen - 2))"
    printf "${BOX_TR}${NC}\n"
}

# Draw box bottom
box_bottom() {
    local width=$(get_width)
    printf "${GRAY}${BOX_BL}"
    draw_line "$((width - 2))"
    printf "${BOX_BR}${NC}\n"
}

# Draw section separator
box_separator() {
    local title="${1:-}"
    local width=$(get_width)
    if [[ -n "$title" ]]; then
        local inner=$((width - 4))
        local stripped
        stripped=$(echo -e "$title" | sed 's/\x1b\[[0-9;]*m//g')
        local tlen=${#stripped}
        local side=$(( (inner - tlen - 2) / 2 ))
        [[ $side -lt 1 ]] && side=1
        printf "${GRAY}${BOX_LT}"
        draw_line "$side"
        printf "${NC} %s ${GRAY}" "$title"
        draw_line "$((inner - side - tlen - 2))"
        printf "${BOX_RT}${NC}\n"
    else
        printf "${GRAY}${BOX_LT}"
        draw_line "$((width - 2))"
        printf "${BOX_RT}${NC}\n"
    fi
}

# Count tasks
count_remaining() {
    grep -c '^\- \[ \]' PRD.md 2>/dev/null || echo "0"
}

count_completed() {
    grep -c '^\- \[x\]' PRD.md 2>/dev/null || echo "0"
}

# Format elapsed time
format_time() {
    local seconds=$1
    local h=$((seconds / 3600))
    local m=$(( (seconds % 3600) / 60 ))
    local s=$((seconds % 60))
    if [[ $h -gt 0 ]]; then
        printf "%dh %02dm %02ds" "$h" "$m" "$s"
    elif [[ $m -gt 0 ]]; then
        printf "%dm %02ds" "$m" "$s"
    else
        printf "%ds" "$s"
    fi
}

get_elapsed() {
    local now=$(date +%s)
    format_time $((now - start_time))
}

# Modern progress bar with Unicode blocks
progress_bar() {
    local done=$1
    local total=$2
    local width=${3:-30}

    if [[ $total -eq 0 ]]; then
        printf "${GRAY}[%*s]${NC} ${DIM}0/0${NC}" "$width" ""
        return
    fi

    local pct=$((done * 100 / total))
    local filled=$((done * width / total))
    local partial=$(( (done * width * 8 / total) % 8 ))
    local partial_adj=0
    [[ $partial -gt 0 ]] && partial_adj=1
    local empty=$((width - filled - partial_adj))

    # Unicode block characters for smooth progress
    local blocks=(' ' '▏' '▎' '▍' '▌' '▋' '▊' '▉' '█')

    printf "${GREEN}["
    for ((i=0; i<filled; i++)); do printf "█"; done
    [[ $partial -gt 0 ]] && printf "${blocks[$partial]}"
    for ((i=0; i<empty; i++)); do printf " "; done
    printf "]${NC} "

    # Color percentage based on progress
    if [[ $pct -ge 80 ]]; then
        printf "${GREEN}%d/%d${NC} ${BOLD}(%d%%)${NC}" "$done" "$total" "$pct"
    elif [[ $pct -ge 50 ]]; then
        printf "${YELLOW}%d/%d${NC} ${BOLD}(%d%%)${NC}" "$done" "$total" "$pct"
    else
        printf "${WHITE}%d/%d${NC} ${BOLD}(%d%%)${NC}" "$done" "$total" "$pct"
    fi
}

# Get current User Story block with visual markers
get_current_task_block() {
    local first_incomplete_line
    first_incomplete_line=$(grep -n '^\- \[ \]' PRD.md 2>/dev/null | head -1 | cut -d: -f1)

    if [[ -z "$first_incomplete_line" ]]; then
        echo "${GREEN}${ICON_OK} All tasks completed!${NC}"
        return
    fi

    local us_line us_line_num total_lines next_section end_line
    us_line=$(head -n "$first_incomplete_line" PRD.md | grep -n '^### US-' | tail -1)
    us_line_num=$(echo "$us_line" | cut -d: -f1)

    if [[ -z "$us_line_num" ]]; then
        echo "${YELLOW}${ICON_WARN} No User Story found${NC}"
        return
    fi

    total_lines=$(wc -l < PRD.md)
    next_section=$(tail -n +$((us_line_num + 1)) PRD.md | grep -n '^### \|^## ' | head -1 | cut -d: -f1)

    if [[ -n "$next_section" ]]; then
        end_line=$((us_line_num + next_section - 1))
    else
        end_line=$total_lines
    fi

    # Output with visual markers
    sed -n "${us_line_num},${end_line}p" PRD.md | awk -v green="$GREEN" -v yellow="$YELLOW" -v gray="$GRAY" -v nc="$NC" -v bold="$BOLD" '
    BEGIN { found_current = 0 }
    /^### US-/ {
        print bold $0 nc
        next
    }
    /^- \[x\]/ {
        gsub(/^- \[x\]/, green "  ✓" nc gray)
        print $0 nc
        next
    }
    /^- \[ \]/ {
        if (found_current == 0) {
            gsub(/^- \[ \]/, yellow bold "  → " nc yellow)
            print $0 "  ← CURRENT" nc
            found_current = 1
        } else {
            gsub(/^- \[ \]/, gray "  ○")
            print $0 nc
        }
        next
    }
    /^[^#]/ && NF > 0 {
        print gray "    " $0 nc
    }
    '
}

# Animated spinner
spin() {
    local pid=$1
    local msg="${2:-Working}"
    local i=0

    # Hide cursor
    tput civis 2>/dev/null || true

    while kill -0 "$pid" 2>/dev/null; do
        printf "\r${CYAN}${SPINNER_FRAMES[$i]}${NC} ${msg}..."
        i=$(( (i + 1) % ${#SPINNER_FRAMES[@]} ))
        sleep 0.1
    done

    # Clear spinner line and show cursor
    printf "\r%*s\r" "$(get_width)" ""
    tput cnorm 2>/dev/null || true
}

# Countdown with live display
countdown() {
    local seconds=$1
    local msg="${2:-Next iteration in}"

    for ((i=seconds; i>0; i--)); do
        printf "\r${GRAY}${ICON_TIME} %s ${BOLD}%ds${NC}${GRAY}... (Ctrl+C to stop)${NC}%*s" "$msg" "$i" "10" ""
        sleep 1
    done
    printf "\r%*s\r" "$(get_width)" ""
}

# Show header with all status info
show_header() {
    local remaining completed total elapsed
    remaining=$(count_remaining)
    completed=$(count_completed)
    total=$((completed + remaining))
    elapsed=$(get_elapsed)

    # Clear screen for clean display
    clear

    # Title box
    box_top "${BOLD}${CYAN}RALPH${NC} ${WHITE}Autonomous Coding Agent${NC}"
    box_line ""
    box_line "${WHITE}Iteration${NC} ${BOLD}#${iteration}${NC}    ${ICON_TIME} ${WHITE}Elapsed${NC} ${BOLD}${elapsed}${NC}    ${WHITE}Failures${NC} ${consecutive_failures}/${STUCK_THRESHOLD}"
    box_line ""

    # Progress section
    box_separator "${WHITE}Progress${NC}"
    box_line ""
    local bar
    bar=$(progress_bar "$completed" "$total" 35)
    box_line "  $bar"
    box_line ""

    # Current task section
    box_separator "${WHITE}Current Task${NC}"
    box_line ""
    while IFS= read -r line; do
        box_line "  $line"
    done <<< "$(get_current_task_block)"
    box_line ""

    # Git log section
    box_separator "${WHITE}Recent Commits${NC}"
    box_line ""
    if git rev-parse --git-dir > /dev/null 2>&1; then
        local commits
        commits=$(git log --oneline -3 2>/dev/null || echo "")
        if [[ -n "$commits" ]]; then
            while IFS= read -r commit; do
                local hash msg
                hash=$(echo "$commit" | cut -d' ' -f1)
                msg=$(echo "$commit" | cut -d' ' -f2-)
                box_line "  ${MAGENTA}${hash}${NC} ${msg}"
            done <<< "$commits"
        else
            box_line "  ${GRAY}(no commits yet)${NC}"
        fi
    else
        box_line "  ${GRAY}(not a git repository)${NC}"
    fi
    box_line ""

    box_bottom

    # Claude output section (outside box for streaming compatibility)
    echo ""
    printf "${CYAN}${BOLD}▼ Claude Code Output ▼${NC}\n"
    printf "${GRAY}"
    draw_line "$(get_width)"
    printf "${NC}\n"
    echo ""
}

# Close Claude output section
close_claude_section() {
    echo ""
    printf "${GRAY}"
    draw_line "$(get_width)"
    printf "${NC}\n"
    printf "${CYAN}${BOLD}▲ End of Output ▲${NC}\n"
    echo ""
}

# Show result status
show_result() {
    local status=$1
    local message=$2
    local elapsed
    elapsed=$(get_elapsed)

    echo ""
    case "$status" in
        success)
            box_top "${GREEN}${ICON_OK} Success${NC}"
            box_line ""
            box_line "  ${GREEN}$message${NC}"
            ;;
        warning)
            box_top "${YELLOW}${ICON_WARN} Warning${NC}"
            box_line ""
            box_line "  ${YELLOW}$message${NC}"
            ;;
        error)
            box_top "${RED}${ICON_FAIL} Error${NC}"
            box_line ""
            box_line "  ${RED}$message${NC}"
            ;;
    esac
    box_line ""
    box_line "  ${ICON_TIME} Total elapsed: ${BOLD}${elapsed}${NC}"
    box_line ""
    box_bottom
}

# Final summary
show_summary() {
    local completed remaining elapsed status_color status_text
    completed=$(count_completed)
    remaining=$(count_remaining)
    elapsed=$(get_elapsed)

    if [[ $remaining -eq 0 ]]; then
        status_color=$GREEN
        status_text="ALL TASKS COMPLETE!"
    else
        status_color=$YELLOW
        status_text="Session Ended"
    fi

    echo ""
    box_top "${status_color}${BOLD}${status_text}${NC}"
    box_line ""
    box_line "  ${WHITE}Tasks completed:${NC}  ${GREEN}${BOLD}$completed${NC}"
    box_line "  ${WHITE}Tasks remaining:${NC}  ${remaining:-0}"
    box_line "  ${WHITE}Total iterations:${NC} $iteration"
    box_line "  ${WHITE}Total time:${NC}       ${BOLD}$elapsed${NC}"
    box_line ""
    if [[ $remaining -gt 0 ]]; then
        box_line "  ${GRAY}To continue: ./ralph1.sh $MAX $SLEEP $STUCK_THRESHOLD${NC}"
    fi
    box_line ""
    box_bottom
}

# === FILE CHECKS ===
if [[ ! -f "PRD.md" ]]; then
    echo ""
    box_top "${RED}${ICON_FAIL} Error${NC}"
    box_line ""
    box_line "  ${RED}PRD.md not found!${NC}"
    box_line "  ${GRAY}Create a PRD.md file with tasks marked as:${NC}"
    box_line "  ${GRAY}  - [ ] Task description${NC}"
    box_line ""
    box_bottom
    exit 1
fi

if [[ ! -f "progress.txt" ]]; then
    cat > progress.txt << 'EOF'
# Progress Log

## Learnings

---
EOF
fi

# === SIGNAL HANDLING ===
cleanup() {
    tput cnorm 2>/dev/null || true  # Restore cursor
    echo ""
    show_summary
    exit 130
}
trap cleanup INT TERM

# === MAIN LOOP ===
while true; do
    ((iteration++))

    # Count before Claude runs
    remaining_before=$(count_remaining)
    completed_before=$(count_completed)

    # All tasks complete?
    if [[ "${remaining_before:-0}" -eq 0 ]]; then
        show_summary
        exit 0
    fi

    # Max iterations check
    if [[ $MAX -ne 0 && $iteration -gt $MAX ]]; then
        echo ""
        show_result "warning" "Reached maximum iterations ($MAX)"
        show_summary
        exit 1
    fi

    # Display header
    show_header

    # Run Claude Code with interactive TUI
    # Using heredoc to pipe prompt while preserving interactive display
    if claude --dangerously-skip-permissions <<< "$PROMPT_TEMPLATE"; then
        claude_exit_code=0
    else
        claude_exit_code=$?
    fi

    # Close Claude output section
    close_claude_section

    # Count after Claude runs
    remaining_after=$(count_remaining)
    completed_after=$(count_completed)

    # Determine status by comparing PRD.md changes
    if [[ $claude_exit_code -ne 0 ]]; then
        show_result "error" "Claude exited with code $claude_exit_code"
        ((consecutive_failures++))
    elif [[ "$completed_after" -gt "$completed_before" ]]; then
        tasks_done=$((completed_after - completed_before))
        show_result "success" "Completed $tasks_done task(s)! ($completed_before → $completed_after)"
        consecutive_failures=0
    elif [[ "$remaining_after" -lt "$remaining_before" ]]; then
        show_result "success" "Progress made on current task"
        consecutive_failures=0
    else
        show_result "warning" "No progress detected in this iteration"
        ((consecutive_failures++))
    fi

    # Check if stuck
    if [[ $consecutive_failures -ge $STUCK_THRESHOLD ]]; then
        echo ""
        box_top "${RED}${ICON_FAIL} Stuck Detection${NC}"
        box_line ""
        box_line "  ${RED}$STUCK_THRESHOLD consecutive iterations without progress${NC}"
        box_line ""
        box_line "  ${WHITE}Possible actions:${NC}"
        box_line "  ${GRAY}  1. Check progress.txt for error details${NC}"
        box_line "  ${GRAY}  2. Fix the issue manually${NC}"
        box_line "  ${GRAY}  3. Re-run: ./ralph1.sh $MAX $SLEEP $STUCK_THRESHOLD${NC}"
        box_line ""
        box_bottom
        exit 2
    fi

    # All done?
    if [[ "${remaining_after:-0}" -eq 0 ]]; then
        show_summary
        exit 0
    fi

    # Countdown to next iteration
    echo ""
    countdown "$SLEEP" "Next iteration in"
done
