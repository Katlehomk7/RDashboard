document.addEventListener('DOMContentLoaded', function() {

    const lastVisitedPage = localStorage.getItem('lastVisitedPage');

    if (lastVisitedPage) {
        showPage(lastVisitedPage);
    } else {
        // Default to service ratings page if no page is stored
        showPage('serviceRatingsPage');
    }
    initializeChart();
  loadComments();
  setCurrentMonthInDropdown();
});

window.addEventListener('beforeunload', function() {
    // Store the current active page in localStorage
    const activePage = document.querySelector('.page.active').id;
    localStorage.setItem('lastVisitedPage', activePage);
});


function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.id === pageId) {
            page.classList.add('active');
            page.style.display = 'block';
        } else {
            page.classList.remove('active');
            page.style.display = 'none';
        }
    });
    
        
    if (pageId === 'dashboardPage') {
        updateDashboardAttentionList();
    }
}
function setCurrentMonthInDropdown() {
    const monthDropdown = document.getElementById('monthDropdown');
    const currentMonth = new Date().getMonth(); // Get the current month (0-11)
    const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ];
    monthDropdown.value = monthNames[currentMonth]; // Set the dropdown to the current month
}


function showRatingValue(rangeId, spanId) {
    const value = document.getElementById(rangeId).value;
    const emoji = getEmojiForRating(value);
    document.getElementById(spanId).textContent = emoji;
}

function getEmojiForRating(value) {
    switch (parseInt(value, 10)) {
        case 0: return '😭 0%';
        case 25: return '😕 25%';
        case 50: return '😐 50%';
        case 75: return '😊 75%';
        case 100: return '😁 100%';
        default: return '😁 100%';
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


const comments = [];

const allRatingsByMonth = JSON.parse(localStorage.getItem('allRatingsByMonth')) || {};

function submitRatings() {
    const currentDate = new Date(); // Initialize currentDate here
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const currentMonthName = monthNames[currentMonth];
    const submissionKey = `${currentYear}-${currentMonthName}`;

    if (localStorage.getItem(submissionKey)) {
        alert("You have already submitted your ratings for this month.");
        return;
    }

    // Save the current date as the submission date
    localStorage.setItem(submissionKey, currentDate.toString());

    // Proceed with the submission logic
    const labRating = parseInt(document.getElementById('labRating').value, 10);
    const printerRating = parseInt(document.getElementById('printerRating').value, 10);
    const studyRoomRating = parseInt(document.getElementById('studyRoomRating').value, 10);
    const laundryRoomRating = parseInt(document.getElementById('laundryRoomRating').value, 10);
    const receptionStaffRating = parseInt(document.getElementById('receptionStaffRating').value, 10);
    const subwardenAssistanceRating = parseInt(document.getElementById('subwardenAssistanceRating').value, 10);
    const uctShuttlePunctualityRating = parseInt(document.getElementById('uctShuttlePunctualityRating').value, 10);
    const cpsAssistanceRating = parseInt(document.getElementById('cpsAssistanceRating').value, 10);
    const otherRating = parseInt(document.getElementById('otherRating').value, 10);

    if (!allRatingsByMonth[currentMonth]) {
        allRatingsByMonth[currentMonth] = [];
    }

    allRatingsByMonth[currentMonth].push({
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

    localStorage.setItem('allRatingsByMonth', JSON.stringify(allRatingsByMonth));

    const averages = calculateAverages(allRatingsByMonth[currentMonth]);
    alert('Ratings submitted successfully!');
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
        
        commentsList.appendChild(commentItem);
    });
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

    const replyButton = document.createElement('button');
    replyButton.textContent = 'Reply';
    replyButton.onclick = function() {
        
        if (document.querySelector('.reply-input')) {
            return; 
        }
        const replyInput = document.createElement('textarea');
        replyInput.classList.add('reply-input');
        replyInput.placeholder = 'Write a reply...';
        const submitReplyButton = document.createElement('button');
        submitReplyButton.textContent = 'Submit Reply';
        submitReplyButton.classList.add('submit-reply-button');
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

    const leftButtonsDiv = document.createElement('div');
    leftButtonsDiv.classList.add('left-buttons');
    leftButtonsDiv.appendChild(replyButton);
    leftButtonsDiv.appendChild(deleteButton);

    commentFooter.appendChild(leftButtonsDiv);
    commentFooter.appendChild(likeButton);
    commentItem.appendChild(commentFooter);

    const repliesContainer = document.createElement('ul');
    repliesContainer.classList.add('replies-container');
    if (replies.length > 0) {
        replies.forEach(replyText => {
            const replyItem = createReplyItem(replyText);
            repliesContainer.appendChild(replyItem);
        });
    }

    commentItem.appendChild(repliesContainer);

    return commentItem;
}
function createReplyItem(replyText, likes = 0, replies = []) {
    const replyItem = document.createElement('li');
    replyItem.classList.add('reply');
    replyItem.innerHTML = `<div class="comment-text">${replyText}</div>`;

    const commentFooter = document.createElement('div');
    commentFooter.classList.add('comment-footer');

    const replyButton = document.createElement('button');
    replyButton.textContent = 'Reply';
    replyButton.onclick = function() {
        // Check if there is already an active reply input
        if (document.querySelector('.reply-input')) {
            return; // Do nothing if a reply input already exists
        }
        const replyInput = document.createElement('textarea');
        replyInput.classList.add('reply-input');
        replyInput.placeholder = 'Write a reply...';
        const submitReplyButton = document.createElement('button');
        submitReplyButton.textContent = 'Submit Reply';
        submitReplyButton.classList.add('submit-reply-button');
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

    const leftButtonsDiv = document.createElement('div');
    leftButtonsDiv.classList.add('left-buttons');
    leftButtonsDiv.appendChild(replyButton);
    leftButtonsDiv.appendChild(deleteButton);

    commentFooter.appendChild(leftButtonsDiv);
    commentFooter.appendChild(likeButton);
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
    const commentItems = commentsList.getElementsByClassName('comment');

    const savedComments = Array.from(commentItems).map(commentItem => {
        const commentText = commentItem.querySelector('.comment-text').textContent;
        const likes = commentItem.querySelector('button[data-likes]').dataset.likes;
        const replies = Array.from(commentItem.querySelectorAll('.replies-container .reply'))
            .map(replyItem => replyItem.childNodes[0].textContent);
        return { text: commentText, likes: parseInt(likes), replies: replies };
    });

    localStorage.setItem('comments', JSON.stringify(savedComments));
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



function updateChartForSelectedMonth() {
    const monthDropdown = document.getElementById('monthDropdown');
    const selectedMonth = monthDropdown.value;
    const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const monthIndex = monthNames.indexOf(selectedMonth);
    const ratingsForSelectedMonth = allRatingsByMonth[monthIndex] || [];
    const averages = calculateAverages(ratingsForSelectedMonth);
    updateDashboardChart(averages);
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
                backgroundColor: 'rgba(255, 99, 142, 0.6)',
                borderColor: 'rgba(255, 99, 142, 1)',
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
function calculateAverages(ratings) {
    if (!ratings || ratings.length === 0) return {};

    const sum = ratings.reduce((acc, rating) => {
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
        labRating: sum.labRating / ratings.length,
        printerRating: sum.printerRating / ratings.length,
        studyRoomRating: sum.studyRoomRating / ratings.length,
        laundryRoomRating: sum.laundryRoomRating / ratings.length,
        receptionStaffRating: sum.receptionStaffRating / ratings.length,
        subwardenAssistanceRating: sum.subwardenAssistanceRating / ratings.length,
        uctShuttlePunctualityRating: sum.uctShuttlePunctualityRating / ratings.length,
        cpsAssistanceRating: sum.cpsAssistanceRating / ratings.length,
        otherRating: sum.otherRating / ratings.length
    };

    return averages;
}


function updateDashboardAttentionList() {
    const averages = calculateAverages();
    const attentionList = document.getElementById('dashboardAttentionList');
    attentionList.innerHTML = '';

    for (const [service, average] of Object.entries(averages)) {
        if (average <= 50) {
            const listItem = document.createElement('li');
            listItem.textContent = `${service}: ${average}%`;
            attentionList.appendChild(listItem);
        }
    }
}
























































