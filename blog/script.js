// 모든 포스트 가져오기
async function fetchPosts() {
    try {
        const response = await fetch('https://scisjustin.pythonanywhere.com/api/posts');
        if (!response.ok) {
            throw new Error('포스트를 불러오는 데 실패했습니다.');
        }
        const posts = await response.json();

        if (posts.length === 0) {
            // 포스트가 없는 경우 메시지 표시
            displayNoPostsMessage();
        } else {
            // 포스트가 있는 경우 포스트 표시 (최신 순으로 정렬)
            displayPosts(posts, 'recent');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 포스트가 없을 때 메시지 표시
function displayNoPostsMessage() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = `
        <div class="no-posts-message">
            <p>아직 아무것도 없네요...<br>포스트를 첫번째로 만들어보는 사람이 되는건 어떨까요?</p>
        </div>
    `;
}

// 포스트를 화면에 표시
function displayPosts(posts, sortOrder = 'recent') {
    const postsContainer = document.getElementById('posts');

    // 정렬
    if (sortOrder === 'recent') {
        posts.sort((a, b) => b.id - a.id); // id가 높은 순 (최신 순)
    } else if (sortOrder === 'oldest') {
        posts.sort((a, b) => a.id - b.id); // id가 낮은 순 (오래된 순)
    }

    // 정렬된 포스트를 화면에 출력
    postsContainer.innerHTML = posts.map(post => `
        <div class="post" data-id="${post.id}">
            <h2>${post.title}</h2>
            <p>${truncateContent(post.content, 70)}</p>
            <small>작성일: ${new Date(post.date).toLocaleDateString()}</small>
        </div>
    `).join('');

    // 포스트 클릭 이벤트 추가
    document.querySelectorAll('.post').forEach(post => {
        post.addEventListener('click', () => {
            const postId = post.getAttribute('data-id');
            window.location.href = `post.html?id=${postId}`;
        });
    });
}


// 내용을 짧게 자르는 함수
function truncateContent(content, maxLength) {
    if (content.length > maxLength) {
        return content.slice(0, maxLength) + '...';
    }
    return content;
}

// 특정 포스트 가져오기
async function fetchPost(postId) {
    try {
        const response = await fetch(`https://scisjustin.pythonanywhere.com/api/posts/${postId}`);
        if (!response.ok) {
            throw new Error('포스트를 불러오는 데 실패했습니다.');
        }
        const post = await response.json();
        displayPost(post);
    } catch (error) {
        console.error('Error:', error);
    }
}

// 포스트 상세 내용을 화면에 표시
function displayPost(post) {
    const postContainer = document.getElementById('post');
    postContainer.innerHTML = `
        <div class="posta">
            <h2>${post.title}</h2>
            <p>${post.content}</p>
        </div>
    `;
}

// 드롭다운 메뉴 이벤트 설정
function setupSortDropdown() {
    const sortDropdown = document.getElementById('sort');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', async (e) => {
            const sortOrder = e.target.value;
            const response = await fetch('https://scisjustin.pythonanywhere.com/api/posts');
            if (response.ok) {
                const posts = await response.json();
                displayPosts(posts, sortOrder);
            }
        });
    }
}

// 새 포스트 작성 폼 제출 이벤트
function setupCreateForm() {
    const createForm = document.getElementById('create-post-form');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // 폼 제출 기본 동작 방지

            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;

            if (!title || !content) {
                alert('제목과 내용을 모두 입력해주세요.');
                return;
            }

            try {
                const response = await fetch('https://scisjustin.pythonanywhere.com/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, content }),
                });

                if (response.ok) {
                    window.location.href = 'index.html'; // 작성 후 메인 페이지로 이동
                } else {
                    throw new Error('포스트 작성에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('포스트 작성 중 오류가 발생했습니다.');
            }
        });
    }
}

// 새 포스트 작성 폼 제출 이벤트
function setupCreateForm() {
    const createForm = document.getElementById('create-post-form');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // 폼 제출 기본 동작 방지

            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;
            const password = document.getElementById('password').value;

            if (!title || !content || !password) {
                alert('제목, 내용, 비밀번호를 모두 입력해주세요.');
                return;
            }

            try {
                const response = await fetch('https://scisjustin.pythonanywhere.com/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, content, password }),
                });

                if (response.ok) {
                    window.location.href = 'index.html'; // 작성 후 메인 페이지로 이동
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '포스트 작성에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert(error.message || '포스트 작성 중 오류가 발생했습니다.');
            }
        });
    }
}

// 삭제 버튼 설정
function setupDeleteButton(postId) {
    const deleteButton = document.getElementById('delete-button');
    const deletePasswordInput = document.getElementById('delete-password');

    if (deleteButton && deletePasswordInput) {
        deleteButton.addEventListener('click', async () => {
            const password = deletePasswordInput.value;

            if (!password) {
                alert('비밀번호를 입력해주세요.');
                return;
            }

            try {
                const response = await fetch(`https://scisjustin.pythonanywhere.com/api/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password }),
                });

                if (response.ok) {
                    alert('포스트가 삭제되었습니다.');
                    window.location.href = 'index.html'; // 삭제 후 메인 페이지로 이동
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '포스트 삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert(error.message || '포스트 삭제 중 오류가 발생했습니다.');
            }
        });
    }
}

// 포스트 상세 내용을 화면에 표시
function displayPost(post) {
    const postContainer = document.getElementById('post');
    // \n을 <br>로 변환
    const contentWithLineBreaks = post.content.replace(/\n/g, '<br>');
    postContainer.innerHTML = `
        <div class="post">
            <h2>${post.title}</h2>
            <p>${contentWithLineBreaks}</p>
        </div>
    `;
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('index.html')) {
        fetchPosts();  // 메인 페이지에서 포스트 불러오기
        setupSortDropdown();  // 드롭다운 메뉴 설정
    } else if (window.location.pathname.endsWith('post.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');  // URL에서 포스트 ID 가져오기
        if (postId) {
            fetchPost(postId);  // 포스트 상세 페이지에서 포스트 불러오기
            setupDeleteButton(postId);  // 삭제 버튼 설정
        }
    } else if (window.location.pathname.endsWith('create.html')) {
        setupCreateForm();  // 새 포스트 작성 페이지에서 폼 설정
    }
});