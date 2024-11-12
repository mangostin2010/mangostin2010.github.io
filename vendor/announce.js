// 페이지가 로드될 때 공지를 확인하여 표시
window.onload = function () {
    const today = new Date().toLocaleDateString();
    const lastClosed = localStorage.getItem('lastClosed');

    // 만약 '오늘 하루 보지 않기'가 선택된 경우, 공지 모달을 표시하지 않음
    if (lastClosed === today) {
        return; // 모달 표시를 중지
    }

    fetch('https://www.swcis.kr/announce.json')
        .then(response => response.json())
        .then(data => {
            // 공지 데이터가 없는 경우 모달을 표시하지 않음
            if (!data.message && !data.image) return;

            // 이미지와 메시지를 설정
            const noticeImage = document.getElementById('notice-image');
            const noticeMessage = document.getElementById('notice-message');
            noticeMessage.textContent = data.message;

            // 이미지 로드 완료 후 모달 표시
            noticeImage.onload = () => {
                document.getElementById('notice-modal').style.display = 'flex';
                // 스크롤 비활성화
                document.body.style.overflow = 'hidden';
            };
            noticeImage.src = data.image;
        })
        .catch(error => console.error('공지 내용을 불러오는 중 오류 발생:', error));
};

// '오늘 하루 보지 않기' 체크박스와 확인 버튼 기능 구현
document.getElementById('confirm-btn').onclick = function () {
    const dontShowToday = document.getElementById('dont-show-today').checked;
    const today = new Date().toLocaleDateString();

    // '오늘 하루 보지 않기'를 선택한 경우 오늘 날짜를 로컬 스토리지에 저장
    if (dontShowToday) {
        localStorage.setItem('lastClosed', today);
    }
  
    // 모달 전체를 숨기고 스크롤 활성화
    document.getElementById('notice-modal').style.display = 'none';
    document.body.style.overflow = ''; // 스크롤 다시 활성화
};

// X 버튼으로 공지 닫기
document.getElementById('close-btn').onclick = function () {
    // 모달 전체를 숨기고 스크롤 활성화
    document.getElementById('notice-modal').style.display = 'none';
    document.body.style.overflow = ''; // 스크롤 다시 활성화
};
