(function() {
        "use strict";

        // ---------- DATA ----------
        // Current logged in user
        let currentUser = null;

        // In-memory "database"
        let users = [
            { id: 1, username: 'alice', fullName: 'Alice Wonder' },
            { id: 2, username: 'bob', fullName: 'Bob Builder' },
            { id: 3, username: 'carol', fullName: 'Carol Danvers' },
        ];

        let posts = [
            { id: 1, userId: 1, content: 'Hello world! 🌍', media: '📸 Sunset photo', timestamp: Date.now() - 3600000, likes: [2,3], comments: [{ userId: 2, text: 'Nice pic!' }, { userId: 3, text: '❤️' }] },
            { id: 2, userId: 2, content: 'Just finished a great book.', media: '📚 Book cover', timestamp: Date.now() - 7200000, likes: [1], comments: [{ userId: 1, text: 'Which book?' }] },
            { id: 3, userId: 3, content: 'Weekend vibes ✨', media: '🎵 playlist', timestamp: Date.now() - 1800000, likes: [], comments: [] },
        ];

        // friend requests: { fromUserId, toUserId, status: 'pending' | 'accepted' }
        let friendRequests = [
            { fromUserId: 2, toUserId: 1, status: 'pending' },
            { fromUserId: 3, toUserId: 1, status: 'pending' },
        ];

        // notifications: array of strings
        let notifications = [
            '📩 Bob sent you a friend request.',
            '📩 Carol sent you a friend request.',
        ];

        // ---------- DOM refs ----------
        const loginContainer = document.getElementById('login-container');
        const feedContainer = document.getElementById('feed-container');
        const usernameInput = document.getElementById('username-input');
        const passwordInput = document.getElementById('password-input');
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');

        const currentUserDisplay = document.getElementById('current-user-display');
        const postsFeed = document.getElementById('posts-feed');
        const postTextarea = document.getElementById('post-textarea');
        const publishBtn = document.getElementById('publish-post-btn');

        const notifText = document.getElementById('notif-text');
        const clearNotifBtn = document.getElementById('clear-notif-btn');

        // Helper: get user by id
        function getUserById(id) {
            return users.find(u => u.id === id);
        }

        // Helper: get current user object
        function getCurrentUser() {
            if (!currentUser) return null;
            return getUserById(currentUser.id);
        }

        // ---------- RENDER FEED ----------
        function renderFeed() {
            if (!currentUser) return;
            const user = getCurrentUser();
            if (!user) return;
            currentUserDisplay.textContent = '@' + user.username;

            // Render posts (sorted newest first)
            const sorted = [...posts].sort((a,b) => b.timestamp - a.timestamp);
            let html = '';
            for (const post of sorted) {
                const author = getUserById(post.userId);
                const authorName = author ? author.fullName : 'Unknown';
                const authorUsername = author ? author.username : 'unknown';
                const likeCount = post.likes ? post.likes.length : 0;
                const isLiked = post.likes && post.likes.includes(currentUser.id);
                const likeClass = isLiked ? 'liked' : '';

                // Comments
                let commentsHtml = '';
                if (post.comments && post.comments.length) {
                    for (const c of post.comments) {
                        const cAuthor = getUserById(c.userId);
                        const cName = cAuthor ? cAuthor.fullName : 'Unknown';
                        commentsHtml += `<div class="comment"><span class="comment-author">${cName}</span> ${c.text}</div>`;
                    }
                }
                // comment input
                const commentInputId = `comment-input-${post.id}`;
                const commentBtnId = `comment-btn-${post.id}`;

                // friend request button for post author (if not self)
                let friendBtnHtml = '';
                if (post.userId !== currentUser.id) {
                    const alreadyRequested = friendRequests.some(fr => 
                        (fr.fromUserId === currentUser.id && fr.toUserId === post.userId && fr.status === 'pending') ||
                        (fr.fromUserId === post.userId && fr.toUserId === currentUser.id && fr.status === 'pending')
                    );
                    const isFriend = friendRequests.some(fr => 
                        (fr.fromUserId === currentUser.id && fr.toUserId === post.userId && fr.status === 'accepted') ||
                        (fr.fromUserId === post.userId && fr.toUserId === currentUser.id && fr.status === 'accepted')
                    );
                    let btnText = 'Add friend';
                    let btnClass = '';
                    if (isFriend) { btnText = '✅ Friend'; btnClass = 'pending'; }
                    else if (alreadyRequested) { btnText = '⏳ Pending'; btnClass = 'pending'; }
                    friendBtnHtml = `<button class="friend-request-btn ${btnClass}" data-target-userid="${post.userId}">${btnText}</button>`;
                }

                const mediaHtml = post.media ? `<div class="post-media"><i class="fas fa-paperclip"></i> ${post.media}</div>` : '';

                html += `
                    <div class="post" data-postid="${post.id}">
                        <div class="post-header">
                            <div class="avatar">${authorName.charAt(0)}</div>
                            <span class="post-author">${authorName} <span style="font-weight:400;color:#3b4a5e;">@${authorUsername}</span></span>
                            <span class="post-time">${new Date(post.timestamp).toLocaleTimeString()}</span>
                            ${friendBtnHtml}
                        </div>
                        <div class="post-content">${post.content}</div>
                        ${mediaHtml}
                        <div class="post-actions">
                            <button class="action-btn like-btn ${likeClass}" data-postid="${post.id}"><i class="fas fa-thumbs-up"></i> <span class="like-count">${likeCount}</span></button>
                            <button class="action-btn comment-toggle" data-postid="${post.id}"><i class="fas fa-comment"></i> Comment</button>
                            <span class="privacy-badge"><i class="fas fa-globe"></i> public</span>
                        </div>
                        <div class="comment-section" id="comment-section-${post.id}">
                            ${commentsHtml}
                            <div class="comment-input">
                                <input type="text" id="${commentInputId}" placeholder="Write a comment...">
                                <button id="${commentBtnId}">Post</button>
                            </div>
                        </div>
                    </div>
                `;
            }
            postsFeed.innerHTML = html;

            // attach event listeners for likes
            document.querySelectorAll('.like-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const postId = parseInt(this.dataset.postid);
                    handleLike(postId);
                });
            });

            // comment toggle (show/hide comment section)
            document.querySelectorAll('.comment-toggle').forEach(btn => {
                btn.addEventListener('click', function() {
                    const postId = parseInt(this.dataset.postid);
                    const section = document.getElementById(`comment-section-${postId}`);
                    if (section) {
                        section.style.display = section.style.display === 'none' ? 'block' : 'none';
                    }
                });
            });

            // comment submit
            for (const post of sorted) {
                const input = document.getElementById(`comment-input-${post.id}`);
                const btn = document.getElementById(`comment-btn-${post.id}`);
                if (input && btn) {
                    btn.addEventListener('click', function() {
                        const text = input.value.trim();
                        if (!text) return;
                        handleAddComment(post.id, text);
                        input.value = '';
                    });
                    input.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            btn.click();
                        }
                    });
                }
            }

            // friend request buttons
            document.querySelectorAll('.friend-request-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const targetUserId = parseInt(this.dataset.targetUserid);
                    handleFriendRequest(targetUserId);
                });
            });

            // update notification
            updateNotification();
        }

        // ---------- HANDLERS ----------
        function handleLike(postId) {
            const post = posts.find(p => p.id === postId);
            if (!post) return;
            if (!post.likes) post.likes = [];
            const idx = post.likes.indexOf(currentUser.id);
            if (idx > -1) {
                post.likes.splice(idx, 1);
                addNotification('👎 You unliked a post.');
            } else {
                post.likes.push(currentUser.id);
                addNotification('👍 You liked a post.');
            }
            renderFeed();
        }

        function handleAddComment(postId, text) {
            const post = posts.find(p => p.id === postId);
            if (!post) return;
            if (!post.comments) post.comments = [];
            post.comments.push({ userId: currentUser.id, text: text });
            addNotification(`💬 You commented: "${text}"`);
            renderFeed();
        }

        function handleFriendRequest(targetUserId) {
            // check if already pending or friends
            const existing = friendRequests.find(fr => 
                (fr.fromUserId === currentUser.id && fr.toUserId === targetUserId) ||
                (fr.fromUserId === targetUserId && fr.toUserId === currentUser.id)
            );
            if (existing) {
                if (existing.status === 'pending') {
                    // accept it (if the request is from target to current)
                    if (existing.fromUserId === targetUserId && existing.toUserId === currentUser.id) {
                        existing.status = 'accepted';
                        addNotification(`✅ You accepted friend request from ${getUserById(targetUserId).fullName}`);
                        renderFeed();
                        return;
                    } else {
                        addNotification(`⏳ Request already pending.`);
                        renderFeed();
                        return;
                    }
                } else if (existing.status === 'accepted') {
                    addNotification(`🤝 Already friends.`);
                    renderFeed();
                    return;
                }
            }
            // send new request
            friendRequests.push({ fromUserId: currentUser.id, toUserId: targetUserId, status: 'pending' });
            addNotification(`📨 Friend request sent to ${getUserById(targetUserId).fullName}`);
            renderFeed();
        }

        function addNotification(text) {
            notifications.push(text);
            if (notifications.length > 20) notifications.shift();
            updateNotification();
        }

        function updateNotification() {
            if (notifications.length === 0) {
                notifText.textContent = '🔔 No new notifications';
            } else {
                notifText.textContent = notifications[notifications.length - 1];
            }
        }

        // clear notifications
        clearNotifBtn.addEventListener('click', function() {
            notifications = [];
            updateNotification();
        });

        // ---------- PUBLISH POST ----------
        function publishPost() {
            const content = postTextarea.value.trim();
            if (!content) return;
            const newPost = {
                id: Date.now(),
                userId: currentUser.id,
                content: content,
                media: '📎 shared ' + (Math.random() > 0.5 ? 'image' : 'link'),
                timestamp: Date.now(),
                likes: [],
                comments: [],
            };
            posts.push(newPost);
            addNotification(`📝 You posted: "${content.substring(0,30)}..."`);
            postTextarea.value = '';
            renderFeed();
        }

        publishBtn.addEventListener('click', publishPost);
        postTextarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                publishPost();
            }
        });

        // ---------- LOGIN / LOGOUT ----------
        function login() {
            const username = usernameInput.value.trim();
            if (!username) { alert('Enter username'); return; }
            // find or create user
            let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
            if (!user) {
                // auto-register
                const newId = users.length ? Math.max(...users.map(u=>u.id)) + 1 : 1;
                user = { id: newId, username: username, fullName: username.charAt(0).toUpperCase() + username.slice(1) };
                users.push(user);
            }
            currentUser = { id: user.id, username: user.username };
            loginContainer.style.display = 'none';
            feedContainer.style.display = 'block';
            renderFeed();
            // welcome notif
            addNotification(`👋 Welcome ${user.fullName}!`);
        }

        function logout() {
            currentUser = null;
            loginContainer.style.display = 'flex';
            feedContainer.style.display = 'none';
            postsFeed.innerHTML = '';
            notifications = [];
            notifText.textContent = '✨ No new notifications';
        }

        loginBtn.addEventListener('click', login);
        logoutBtn.addEventListener('click', logout);

        // press enter on login
        passwordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
        usernameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });

        // (optional) prefill demo: auto-login
        // auto login for quick demo
        window.addEventListener('load', function() {
            // set default user
            usernameInput.value = 'alice';
            passwordInput.value = '123';
            // auto login after 300ms
            setTimeout(() => {
                login();
            }, 400);
        });

        // expose render for debugging
        window.renderFeed = renderFeed;
    })();