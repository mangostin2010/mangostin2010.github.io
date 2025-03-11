// 페이지가 로드될 때 공지를 확인하여 표시
console.log('announce.js 로드됨'); // 스크립트가 로드되었는지 확인

window.onload = function () {
    console.log('window.onload 이벤트 발생'); // onload 이벤트가 발생했는지 확인
    
    const today = new Date().toLocaleDateString();
    const lastClosed = localStorage.getItem('lastClosed');
    
    console.log('오늘 날짜:', today);
    console.log('마지막으로 닫은 날짜:', lastClosed);

    // 만약 '오늘 하루 보지 않기'가 선택된 경우, 공지 모달을 표시하지 않음
    if (lastClosed === today) {
        console.log('오늘 하루 보지 않기 설정됨, 모달 표시 중지');
        return; // 모달 표시를 중지
    }

    // PythonAnywhere API 엔드포인트로 변경
    console.log('API 요청 시작');
    fetch('https://scisjustin.pythonanywhere.com/api/announcement')
    .then(response => {
        console.log('API 응답 받음:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('데이터 받음:', data);
        
        // 공지 데이터가 없는 경우 모달을 표시하지 않음
        if (!data.message && !data.image) {
            console.log('공지 데이터 없음, 모달 표시 중지');
            return;
        }

        // 이미지와 메시지를 설정
        const noticeImage = document.getElementById('notice-image');
        const noticeMessage = document.getElementById('notice-message');
        
        if (!noticeImage || !noticeMessage) {
            console.error('모달 요소를 찾을 수 없음:', {
                noticeImage: !!noticeImage,
                noticeMessage: !!noticeMessage
            });
            return;
        }
        
        // textContent를 innerHTML로 변경하여 HTML 태그 지원
        noticeMessage.innerHTML = data.message;
        console.log('메시지 설정됨:', data.message);

        // 이미지가 없거나 공백인 경우 이미지 숨기고 바로 모달 표시
        if (!data.image || data.image === '') {
            console.log('이미지 없음, 이미지 숨김 처리');
            noticeImage.style.display = 'none';
            
            // 이미지 없이 텍스트만 표시
            const modal = document.getElementById('notice-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } else {
                console.error('notice-modal 요소를 찾을 수 없음');
            }
            return;
        }
        
        // 이미지가 있는 경우 표시
        noticeImage.style.display = 'block';
        
        // 이미지 로드 완료 후 모달 표시
        noticeImage.onload = () => {
            console.log('이미지 로드 완료, 모달 표시');
            const modal = document.getElementById('notice-modal');
            if (modal) {
                modal.style.display = 'flex';
                // 스크롤 비활성화
                document.body.style.overflow = 'hidden';
            } else {
                console.error('notice-modal 요소를 찾을 수 없음');
            }
        };
            
            noticeImage.onerror = () => {
                console.error('이미지 로드 실패:', data.image);
                // 이미지 로드 실패해도 모달은 표시
                const modal = document.getElementById('notice-modal');
                if (modal) {
                    modal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            };
            
            console.log('이미지 로드 시작:', data.image);
            noticeImage.src = data.image;
        })
        .catch(error => {
            console.error('공지 내용을 불러오는 중 오류 발생:', error);
        });
};

// '오늘 하루 보지 않기' 체크박스와 확인 버튼 기능 구현
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료, 이벤트 리스너 설정');
    
    const confirmBtn = document.getElementById('confirm-btn');
    const closeBtn = document.getElementById('close-btn');
    
    if (confirmBtn) {
        confirmBtn.onclick = function () {
            console.log('확인 버튼 클릭됨');
            const dontShowToday = document.getElementById('dont-show-today').checked;
            const today = new Date().toLocaleDateString();

            // '오늘 하루 보지 않기'를 선택한 경우 오늘 날짜를 로컬 스토리지에 저장
            if (dontShowToday) {
                console.log('오늘 하루 보지 않기 설정됨');
                localStorage.setItem('lastClosed', today);
            }
          
            // 모달 전체를 숨기고 스크롤 활성화
            document.getElementById('notice-modal').style.display = 'none';
            document.body.style.overflow = ''; // 스크롤 다시 활성화
        };
    } else {
        console.error('confirm-btn 요소를 찾을 수 없음');
    }

    // X 버튼으로 공지 닫기
    if (closeBtn) {
        closeBtn.onclick = function () {
            console.log('닫기 버튼 클릭됨');
            // 모달 전체를 숨기고 스크롤 활성화
            document.getElementById('notice-modal').style.display = 'none';
            document.body.style.overflow = ''; // 스크롤 다시 활성화
        };
    } else {
        console.error('close-btn 요소를 찾을 수 없음');
    }
});