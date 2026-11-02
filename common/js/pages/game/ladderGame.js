
        const canvas = document.getElementById('ladder-canvas');
        const ctx = canvas.getContext('2d');
        const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'];

        let ladderWidth = 600;
        let ladderHeight = 400;
        let numPlayers = 0;
        let lines = []; // 가로줄 정보 저장
        let paths = []; // 각 플레이어의 전체 경로 좌표 저장

        // 사다리 초기화 및 그리기
        function initLadder() {
            numPlayers = parseInt(document.getElementById('player-count').value);
            if (numPlayers < 2 || numPlayers > 10) return alert("2명에서 10명 사이로 입력해주세요.");

            document.getElementById('game-wrapper').style.display = 'block';
            document.getElementById('result-summary').style.display = 'none';
            document.getElementById('start-btn').disabled = false;

            setupInputs();
            generateLadderData();
            drawLadderBase();
        }

        // 입력창 배치
        function setupInputs() {
            const topArea = document.getElementById('top-inputs');
            const bottomArea = document.getElementById('bottom-inputs');
            topArea.innerHTML = '';
            bottomArea.innerHTML = '';

            canvas.width = (numPlayers - 1) * 120 + 100;
            canvas.height = 400;
            const spacing = (canvas.width - 100) / (numPlayers - 1);

            for (let i = 0; i < numPlayers; i++) {
                const x = 50 + i * spacing;
                
                // 이름 입력창
                createInput(topArea, x, 'top', `참가자 ${i + 1}`, `name-${i}`);
                // 결과 입력창
                createInput(bottomArea, x, 'bottom', `결과 ${i + 1}`, `result-${i}`);
            }
        }

        function createInput(parent, x, posClass, placeholder, id) {
            const div = document.createElement('div');
            div.className = `input-container ${posClass}`;
            div.style.left = `${x + 40}px`; // padding 고려
            div.innerHTML = `<input type="text" id="${id}" placeholder="${placeholder}">`;
            parent.appendChild(div);
        }

        // 가로줄 생성 알고리즘
        function generateLadderData() {
            lines = [];
            const rows = 10; // 높이 구간 10단계
            for (let r = 1; r < rows; r++) {
                for (let c = 0; c < numPlayers - 1; c++) {
                    // 연속 가로줄 방지 및 랜덤 생성
                    if (Math.random() > 0.6) {
                        if (lines.find(l => l.row === r && (l.col === c-1 || l.col === c+1))) continue;
                        lines.push({ row: r, col: c });
                    }
                }
            }
        }

        // 기본 사다리 틀 그리기
        function drawLadderBase() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#ced4da';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';

            const spacing = (canvas.width - 100) / (numPlayers - 1);

            // 세로줄
            for (let i = 0; i < numPlayers; i++) {
                ctx.beginPath();
                ctx.moveTo(50 + i * spacing, 0);
                ctx.lineTo(50 + i * spacing, canvas.height);
                ctx.stroke();
            }

            // 가로줄
            lines.forEach(line => {
                const x = 50 + line.col * spacing;
                const y = (canvas.height / 10) * line.row;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + spacing, y);
                ctx.stroke();
            });
        }

        // 사다리 타기 시작 (애니메이션)
        async function startLadderGame() {
            document.querySelectorAll('input').forEach(input => input.readOnly = true);
            document.getElementById('start-btn').disabled = true;
            
            paths = [];
            const spacing = (canvas.width - 100) / (numPlayers - 1);

            for (let i = 0; i < numPlayers; i++) {
                const path = calculatePath(i, spacing);
                paths.push({player: i, path: path});
                await animatePath(path, colors[i]);
            }

            showSummary();
        }

        // 경로 계산 로직
        function calculatePath(startIdx, spacing) {
            let currCol = startIdx;
            let currY = 0;
            const path = [{x: 50 + currCol * spacing, y: 0}];
            const sortedLines = [...lines].sort((a, b) => a.row - b.row);

            for(let r = 1; r <= 10; r++) {
                let targetY = (canvas.height / 10) * r;
                if (r === 10) targetY = canvas.height;

                // 현재 줄(row)에 연결된 가로줄 확인
                const horizontal = lines.find(l => l.row === r && (l.col === currCol || l.col === currCol - 1));

                if (horizontal) {
                    path.push({x: 50 + currCol * spacing, y: targetY}); // 세로 이동
                    currCol = (horizontal.col === currCol) ? currCol + 1 : currCol - 1;
                    path.push({x: 50 + currCol * spacing, y: targetY}); // 가로 이동
                } else {
                    path.push({x: 50 + currCol * spacing, y: targetY});
                }
            }
            return path;
        }

        // 선 그리기 애니메이션
        function animatePath(path, color) {
            return new Promise((resolve) => {
                let step = 0;
                ctx.strokeStyle = color;
                ctx.lineWidth = 6;

                function draw() {
                    if (step >= path.length - 1) {
                        resolve();
                        return;
                    }

                    const start = path[step];
                    const end = path[step + 1];
                    
                    let progress = 0;
                    const speed = 0.15; // 이동 속도

                    function animateLine() {
                        progress += speed;
                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                        ctx.lineTo(start.x + (end.x - start.x) * Math.min(progress, 1), 
                                   start.y + (end.y - start.y) * Math.min(progress, 1));
                        ctx.stroke();

                        if (progress < 1) {
                            requestAnimationFrame(animateLine);
                        } else {
                            step++;
                            draw();
                        }
                    }
                    animateLine();
                }
                draw();
            });
        }

        // 최종 결과 출력
        function showSummary() {
            const summary = document.getElementById('result-summary');
            const list = document.getElementById('summary-list');
            summary.style.display = 'block';
            list.innerHTML = '';

            paths.forEach((p, i) => {
                const name = document.getElementById(`name-${i}`).value || `참가자 ${i+1}`;
                const finalX = p.path[p.path.length - 1].x;
                const spacing = (canvas.width - 100) / (numPlayers - 1);
                const resultIdx = Math.round((finalX - 50) / spacing);
                const resultValue = document.getElementById(`result-${resultIdx}`).value || `결과 ${resultIdx + 1}`;

                const item = document.createElement('div');
                item.className = 'result-item';
                item.style.color = colors[i];
                item.innerHTML = `<span>${name}</span> <span>----→</span> <span>${resultValue}</span>`;
                list.appendChild(item);
            });
            
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    