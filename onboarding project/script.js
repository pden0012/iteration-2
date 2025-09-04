function showMessage() {
    alert("你点击了按钮！");
}

function toggleBox() {
    const box = document.getElementById("hiddenBox");
    if (box.style.display === "none" || box.style.display === "") {
        box.style.display = "block";
    } else {
        box.style.display = "none";
    }
}

function goToPage() {
    // 如果以后有 page2.html，可以用下面的代码跳转
    // window.location.href = "page2.html";
    alert("这里可以跳转到另一个页面！");
}