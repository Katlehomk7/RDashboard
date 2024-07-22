document.addEventListener('DOMContentLoaded', () => {
 showPage(serviceRatingPage);
    initializeChart();
  loadComments();
});

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.id === pageId) {
            page.style.display = 'block';
        } else {
            page.style.display = 'none';
        }
    });

    if (pageId === 'dashboardPage') {
        updateDashboardAttentionList();
    }
}

function showRatingValue(rangeId, spanId) {
    const value = document.getElementById(rangeId).value;
    const emoji = getEmojiForRating(value);
    document.getElementById(spanId).textContent = emoji;
}

function getEmojiForRating(value) {
    switch (parseInt(value, 10)) {
        case 0: return '😭';
        case 25: return '😕';
        case 50: return '😐';
        case 75: return '😊';
        case 100: return '😁';
        default: return '😁';
    }
}

function showTooltip(sliderId) {
    const value = document.getElementById(sliderId).value;
    const tooltip = document.getElementById('tooltip');
    tooltip.innerText = getTooltipForValue(value);
    tooltip.style.display = 'block';

    document.getElementById(sliderId).addEventListener('mousemove', (event) => {
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
    });
}

function hideTooltip() {
    document.getElementById('tooltip').style.display = 'none';
}

function getTooltipForValue(value) {
    switch (value) {
        case '0':
            return 'Very Bad';
        case '25':
            return 'Just Awful';
        case '50':
            return 'Not Too Good Yet Not Too Bad';
        case '75':
            return 'I Mean It\'s Alright';
        case '100':
            return 'Perfect, Just Perfect!';
        default:
            return '';
    }
}

const allRatings = [];
const comments = [];

function submitRatings() {
    const labRating = parseInt(document.getElementById('labRating').value, 10);
    const printerRating = parseInt(document.getElementById('printerRating').value, 10);
    const studyRoomRating = parseInt(document.getElementById('studyRoomRating').value, 10);
    const laundryRoomRating = parseInt(document.getElementById('laundryRoomRating').value, 10);
    const receptionStaffRating = parseInt(document.getElementById('receptionStaffRating').value, 10);
    const subwardenAssistanceRating = parseInt(document.getElementById('subwardenAssistanceRating').value, 10);
    const uctShuttlePunctualityRating = parseInt(document.getElementById('uctShuttlePunctualityRating').value, 10);
    const cpsAssistanceRating = parseInt(document.getElementById('cpsAssistanceRating').value, 10);
    const otherRating = parseInt(document.getElementById('otherRating').value, 10);

    allRatings.push({ 
        labRating, 
        printerRating, 
        studyRoomRating,
        laundryRoomRating,
        receptionStaffRating,
        subwardenAssistanceRating,
        uctShuttlePunctualityRating,
        cpsAssistanceRating,
        otherRating
    });

    const averages = calculateAverages();
    displayAttentionAreas(averages);
    updateDashboardChart(averages);
}
function loadComments() {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    const savedComments = JSON.parse(localStorage.getItem('comments')) || [];
    savedComments.forEach(comment => {
        const commentItem = createCommentItem(comment.text);
        commentItem.querySelector('button[data-likes]').dataset.likes = comment.likes;
        commentItem.querySelector('button[data-likes]').textContent = `Like (${comment.likes})`;
        const repliesContainer = commentItem.querySelector('.replies-container');
        comment.replies.forEach(replyText => {
            const replyItem = createReplyItem(replyText);
            repliesContainer.appendChild(replyItem);
        });
        commentsList.appendChild(commentItem);
    });
}
function calculateAverages() {
    const sum = allRatings.reduce((acc, rating) => {
        acc.labRating += rating.labRating;
        acc.printerRating += rating.printerRating;
        acc.studyRoomRating += rating.studyRoomRating;
        acc.laundryRoomRating += rating.laundryRoomRating;
        acc.receptionStaffRating += rating.receptionStaffRating;
        acc.subwardenAssistanceRating += rating.subwardenAssistanceRating;
        acc.uctShuttlePunctualityRating += rating.uctShuttlePunctualityRating;
        acc.cpsAssistanceRating += rating.cpsAssistanceRating;
        acc.otherRating += rating.otherRating;
        return acc;
    }, {
        labRating: 0,
        printerRating: 0,
        studyRoomRating: 0,
        laundryRoomRating: 0,
        receptionStaffRating: 0,
        subwardenAssistanceRating: 0,
        uctShuttlePunctualityRating: 0,
        cpsAssistanceRating: 0,
        otherRating: 0
    });

    const averages = {
        labRating: sum.labRating / allRatings.length,
        printerRating: sum.printerRating / allRatings.length,
        studyRoomRating: sum.studyRoomRating / allRatings.length,
        laundryRoomRating: sum.laundryRoomRating / allRatings.length,
        receptionStaffRating: sum.receptionStaffRating / allRatings.length,
        subwardenAssistanceRating: sum.subwardenAssistanceRating / allRatings.length,
        uctShuttlePunctualityRating: sum.uctShuttlePunctualityRating / allRatings.length,
        cpsAssistanceRating: sum.cpsAssistanceRating / allRatings.length,
        otherRating: sum.otherRating/ allRatings.length
    };

    return averages;
}

function displayAttentionAreas(averages) {
    const attentionList = document.getElementById('attentionList');
    attentionList.innerHTML = '';

    for (const [service, average] of Object.entries(averages)) {
        if (average <= 50) {
            const listItem = document.createElement('li');
            listItem.textContent = `${service}: ${average}%`;
            attentionList.appendChild(listItem);
        }
    }
}
function submitComment() {
    const commentInput = document.getElementById('commentsInput');
    const commentText = commentInput.value.trim();
    if (commentText === '') return;

    const commentsList = document.getElementById('commentsList');
    const commentItem = createCommentItem(commentText);
    commentsList.appendChild(commentItem);

    saveComments();

    commentInput.value = '';
}

function createCommentItem(commentText, likes = 0, replies = []) {
    const commentItem = document.createElement('li');
    commentItem.classList.add('comment');
    commentItem.innerHTML = `<div class="comment-text">${commentText}</div>`;

    const commentFooter = document.createElement('div');
    commentFooter.classList.add('comment-footer');

    const likeButton = document.createElement('button');
    likeButton.textContent = `Like (${likes})`;
    likeButton.dataset.likes = likes;
    likeButton.dataset.liked = 'false';
    likeButton.onclick = function() {
        if (likeButton.dataset.liked === 'false') {
            const likes = parseInt(likeButton.dataset.likes) + 1;
            likeButton.dataset.likes = likes;
            likeButton.textContent = `Like (${likes})`;
            likeButton.dataset.liked = 'true';
            saveComments();
        }
    };

    const replyButton = document.createElement('button');
    replyButton.textContent = 'Reply';
    replyButton.onclick = function() {
        const existingReplyInput = commentItem.querySelector('.reply-input');
        if (existingReplyInput) {
            existingReplyInput.remove();
        }
        const replyInput = document.createElement('textarea');
        replyInput.classList.add('reply-input');
        replyInput.placeholder = 'Write a reply...';
        const submitReplyButton = document.createElement('button');
        submitReplyButton.textContent = 'Submit Reply';
        submitReplyButton.onclick = function() {
            const replyText = replyInput.value.trim();
            if (replyText === '') return;
            const replyItem = createReplyItem(replyText);
            commentItem.querySelector('.replies-container').appendChild(replyItem);
            replyInput.remove();
            submitReplyButton.remove();
            saveComments();
        };
        commentItem.appendChild(replyInput);
        commentItem.appendChild(submitReplyButton);
    };

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function() {
        commentItem.remove();
        saveComments();
    };

    commentFooter.appendChild(likeButton);
    commentFooter.appendChild(replyButton);
    commentFooter.appendChild(deleteButton);
    commentItem.appendChild(commentFooter);

    const repliesContainer = document.createElement('ul');
    repliesContainer.classList.add('replies-container');
    replies.forEach(reply => {
        const replyItem = createReplyItem(reply.text, reply.likes, reply.replies);
        repliesContainer.appendChild(replyItem);
    });
    commentItem.appendChild(repliesContainer);

    return commentItem;
}

function createReplyItem(replyText, likes = 0, replies = []) {
    const replyItem = document.createElement('li');
    replyItem.classList.add('comment');
    replyItem.innerHTML = `<div class="comment-text">${replyText}</div>`;

    const commentFooter = document.createElement('div');
    commentFooter.classList.add('comment-footer');

    const likeButton = document.createElement('button');
    likeButton.textContent = `Like (${likes})`;
    likeButton.dataset.likes = likes;
    likeButton.dataset.liked = 'false';
    likeButton.onclick = function() {
        if (likeButton.dataset.liked === 'false') {
            const likes = parseInt(likeButton.dataset.likes) + 1;
            likeButton.dataset.likes = likes;
            likeButton.textContent = `Like (${likes})`;
            likeButton.dataset.liked = 'true';
            saveComments();
        }
    };

    const replyButton = document.createElement('button');
    replyButton.textContent = 'Reply';
    replyButton.onclick = function() {
        const existingReplyInput = replyItem.querySelector('.reply-input');
        if (existingReplyInput) {
            existingReplyInput.remove();
        }
        const replyInput = document.createElement('textarea');
        replyInput.classList.add('reply-input');
        replyInput.placeholder = 'Write a reply...';
        const submitReplyButton = document.createElement('button');
        submitReplyButton.textContent = 'Submit Reply';
        submitReplyButton.onclick = function() {
            const replyText = replyInput.value.trim();
            if (replyText === '') return;
            const nestedReplyItem = createReplyItem(replyText);
            replyItem.querySelector('.replies-container').appendChild(nestedReplyItem);
            replyInput.remove();
            submitReplyButton.remove();
            saveComments();
        };
        replyItem.appendChild(replyInput);
        replyItem.appendChild(submitReplyButton);
    };

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function() {
        replyItem.remove();
        saveComments();
    };

    commentFooter.appendChild(likeButton);
    commentFooter.appendChild(replyButton);
    commentFooter.appendChild(deleteButton);
    replyItem.appendChild(commentFooter);

    const repliesContainer = document.createElement('ul');
    repliesContainer.classList.add('replies-container');
    replies.forEach(reply => {
        const nestedReplyItem = createReplyItem(reply.text, reply.likes, reply.replies);
        repliesContainer.appendChild(nestedReplyItem);
    });
    replyItem.appendChild(repliesContainer);

    return replyItem;

}

function saveComments() {
    const commentsList = document.getElementById('commentsList');
    const comments = [];
    commentsList.querySelectorAll('li.comment').forEach(commentItem => {
        const commentText = commentItem.querySelector('.comment-text').textContent;
        const likes = parseInt(commentItem.querySelector('button[data-likes]').dataset.likes);
        const replies = saveReplies(commentItem.querySelector('.replies-container'));
        const comment = { text: commentText, likes: likes, replies: replies };
        comments.push(comment);
    });
    localStorage.setItem('comments', JSON.stringify(comments));
}

function saveReplies(repliesContainer) {
    const replies = [];
    repliesContainer.querySelectorAll('li.comment').forEach(replyItem => {
        const replyText = replyItem.querySelector('.comment-text').textContent;
        const likes = parseInt(replyItem.querySelector('button[data-likes]').dataset.likes);
        const nestedReplies = saveReplies(replyItem.querySelector('.replies-container'));
        const reply = { text: replyText, likes: likes, replies: nestedReplies };
        replies.push(reply);
    });
    return replies;
}

function loadComments() {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    const savedComments = JSON.parse(localStorage.getItem('comments')) || [];
    savedComments.forEach(comment => {
        const commentItem = createCommentItem(comment.text, comment.likes, comment.replies);
        commentsList.appendChild(commentItem);
    });
}



function initializeChart() {
    const ctx = document.getElementById('ratingsChart').getContext('2d');
    window.ratingsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                'Lab Assistance',
                'Printer Functionality',
                'Study Room Conditions',
                'Laundry Room Conditions',
                'Reception Staff Assistance',
                'Subwarden Assistance',
                'UCT Shuttle Punctuality',
                'CPS Assistance',
                'Other'
            ],
            datasets: [{
                label: 'Average Ratings',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateDashboardChart(averages) {
    const ratingsChart = window.ratingsChart;
    ratingsChart.data.datasets[0].data = [
        averages.labRating,
        averages.printerRating,
        averages.studyRoomRating,
        averages.laundryRoomRating,
        averages.receptionStaffRating,
        averages.subwardenAssistanceRating,
        averages.uctShuttlePunctualityRating,
        averages.cpsAssistanceRating,
        averages.otherRating
        
    ];
    ratingsChart.update();
}

function updateDashboardAttentionList() {
    const averages = calculateAverages();
    const attentionList = document.getElementById('dashboardAttentionList');
    attentionList.innerHTML = '';

    for (const [service, average] of Object.entries(averages)) {
        if (average < 50) {
            const listItem = document.createElement('li');
            listItem.textContent = `${service}: ${average}%`;
            attentionList.appendChild(listItem);
        }
    }
}
























































