window.addEventListener("load", function() {
    const preloader = document.getElementById("js-preloader");
    // 서서히 사라지는 효과를 위해 transition 적용
    preloader.style.transition = "opacity 0.5s ease";
    preloader.style.opacity = "0";
    // 0.5초 후에 display:none 처리
    setTimeout(() => {
        preloader.style.display = "none";
    }, 500);
});
