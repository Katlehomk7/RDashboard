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
    const activePage = document.querySelector('.page.active')?.id;
    if (activePage) {
        localStorage.setItem('lastVisitedPage', activePage);
    }
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
document.getElementById('submitRatingButton').addEventListener('click', submitRatings);
document.getElementById('submitCommentButton').addEventListener('click', submitComment);

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

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDH68FZzuRzlCilnRn4ZdD2KT4YenFVROw",
  authDomain: "res-dashboard-2024.firebaseapp.com",
  projectId: "res-dashboard-2024",
  storageBucket: "res-dashboard-2024.appspot.com",
  messagingSenderId: "714919854372",
  appId: "1:714919854372:web:14ba08978c5bf0aa41b3b1",
  measurementId: "G-PPJ0NN2QMF"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const comments = [];  // Ensure comments are initialized properly

function submitRatings() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const currentMonthName = monthNames[currentMonth];
    const submissionKey = `${userId}-${currentYear}-${currentMonthName}`;

    // Check if the user has already submitted for the current month in Firestore
    db.collection('ratingsByMonth').doc(submissionKey).get().then((doc) => {
        if (doc.exists) {
            alert("You have already submitted your ratings for this month.");
        } else {
            // Gather ratings input values
            const labRating = parseInt(document.getElementById('labRating').value, 10) || 0;
            const printerRating = parseInt(document.getElementById('printerRating').value, 10) || 0;
            const studyRoomRating = parseInt(document.getElementById('studyRoomRating').value, 10) || 0;
            const laundryRoomRating = parseInt(document.getElementById('laundryRoomRating').value, 10) || 0;
            const receptionStaffRating = parseInt(document.getElementById('receptionStaffRating').value, 10) || 0;
            const subwardenAssistanceRating = parseInt(document.getElementById('subwardenAssistanceRating').value, 10) || 0;
            const uctShuttlePunctualityRating = parseInt(document.getElementById('uctShuttlePunctualityRating').value, 10) || 0;
            const cpsAssistanceRating = parseInt(document.getElementById('cpsAssistanceRating').value, 10) || 0;
            const otherRating = parseInt(document.getElementById('otherRating').value, 10) || 0;

            // Validate that ratings are within an acceptable range (0-100)
            if (!isValidRating(labRating) || !isValidRating(printerRating) ||
                !isValidRating(studyRoomRating) || !isValidRating(laundryRoomRating) ||
                !isValidRating(receptionStaffRating) || !isValidRating(subwardenAssistanceRating) ||
                !isValidRating(uctShuttlePunctualityRating) || !isValidRating(cpsAssistanceRating) ||
                !isValidRating(otherRating)) {
                alert("Please provide valid ratings between 0 and 100.");
                return;
            }

            const ratingData = {
                labRating,
                printerRating,
                studyRoomRating,
                laundryRoomRating,
                receptionStaffRating,
                subwardenAssistanceRating,
                uctShuttlePunctualityRating,
                cpsAssistanceRating,
                otherRating,
                submissionDate: currentDate,
                userId: userId
            };

            // Save the ratings to Firestore
            db.collection('ratingsByMonth').doc(submissionKey).set(ratingData).then(() => {
                alert('Ratings submitted successfully!');
                fetchRatingsForMonth(currentMonthName, currentYear);
            }).catch((error) => {
                console.error('Error submitting ratings: ', error);
                alert("There was an error submitting your ratings. Please try again.");
            });
        }
    }).catch((error) => {
        console.error('Error checking previous submission: ', error);
        alert("There was an error checking previous submissions. Please try again.");
    });
}

function isValidRating(value) {
    return value >= 0 && value <= 100;
}

function fetchRatingsForMonth(monthName, year) {
    const submissionKeyPrefix = `${year}-${monthName}`;
    
    // Fetch all ratings for the selected month from Firestore
    db.collection('ratingsByMonth').where('userId', '==', userId)
        .where(firebase.firestore.FieldPath.documentId(), '>=', `${submissionKeyPrefix}-`)
        .where(firebase.firestore.FieldPath.documentId(), '<', `${submissionKeyPrefix}-\uf8ff`)
        .get().then((querySnapshot) => {
            const allRatings = [];
            querySnapshot.forEach((doc) => {
                allRatings.push(doc.data());
            });

            const averages = calculateAverages(allRatings);
            displayAttentionAreas(averages);
            updateDashboardChart(averages);
        }).catch((error) => {
            console.error('Error fetching ratings: ', error);
            alert("There was an error fetching ratings. Please try again.");
        });
}

function displayAttentionAreas(averages) {
    const attentionList = document.getElementById('attentionList');
    attentionList.innerHTML = '';

    Object.entries(averages).forEach(([service, average]) => {
        if (average <= 50) {
            const listItem = document.createElement('li');
            listItem.textContent = `${service}: ${average}%`;
            attentionList.appendChild(listItem);
        }
    });
}
// Submit a new comment to Firestore
function submitComment() {
    const commentInput = document.getElementById('commentsInput');
    const commentText = commentInput.value.trim();

    if (commentText === '') {
        alert("Please enter a comment before submitting.");
        return;
    }

    const newComment = {
        text: commentText,
        likes: 0,
        replies: [],
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userId: userId
    };

    db.collection('comments').add(newComment).then(() => {
        commentInput.value = ''; // Clear the input after submission
    }).catch(error => {
        console.error("Error adding comment: ", error);
        alert("There was an error submitting your comment. Please try again.");
    });
}

// Create a comment item element
function createCommentItem(commentData, commentId) {
    const { text, likes, replies } = commentData;

    const commentItem = document.createElement('li');
    commentItem.classList.add('comment');
    commentItem.innerHTML = `<div class="comment-text">${text}</div>`;

    const commentFooter = document.createElement('div');
    commentFooter.classList.add('comment-footer');

    const replyButton = createReplyButton(commentId, commentItem);
    const deleteButton = createDeleteButton(commentId);
    const likeButton = createLikeButton(commentId, likes);

    const leftButtonsDiv = document.createElement('div');
    leftButtonsDiv.classList.add('left-buttons');
    leftButtonsDiv.appendChild(replyButton);
    leftButtonsDiv.appendChild(deleteButton);

    commentFooter.appendChild(leftButtonsDiv);
    commentFooter.appendChild(likeButton);
    commentItem.appendChild(commentFooter);

    // Add replies
    const repliesContainer = document.createElement('ul');
    repliesContainer.classList.add('replies-container');
    if (replies && replies.length > 0) {
        replies.forEach(reply => {
            const replyItem = createReplyItem(reply);
            repliesContainer.appendChild(replyItem);
        });
    }
    commentItem.appendChild(repliesContainer);

    return commentItem;
}

// Create a reply button
function createReplyButton(commentId, commentItem) {
    const replyButton = document.createElement('button');
    replyButton.textContent = 'Reply';
    replyButton.onclick = function () {
        // Check if there's already an active reply input
        if (commentItem.querySelector('.reply-input')) return;

        const replyInput = document.createElement('textarea');
        replyInput.classList.add('reply-input');
        replyInput.placeholder = 'Write a reply...';

        const submitReplyButton = document.createElement('button');
        submitReplyButton.textContent = 'Submit Reply';
        submitReplyButton.classList.add('submit-reply-button');
        submitReplyButton.onclick = function () {
            const replyText = replyInput.value.trim();
            if (replyText === '') {
                alert("Please enter a reply before submitting.");
                return;
            }

            const newReply = {
                text: replyText,
                likes: 0,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: userId
            };

            db.collection('comments').doc(commentId).update({
                replies: firebase.firestore.FieldValue.arrayUnion(newReply)
            }).then(() => {
                replyInput.remove();
                submitReplyButton.remove();
            }).catch(error => {
                console.error("Error adding reply: ", error);
                alert("There was an error submitting your reply. Please try again.");
            });
        };

        commentItem.appendChild(replyInput);
        commentItem.appendChild(submitReplyButton);
    };
    return replyButton;
}

// Create a delete button
function createDeleteButton(commentId) {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function () {
        if (confirm("Are you sure you want to delete this comment?")) {
            db.collection('comments').doc(commentId).delete().catch(error => {
                console.error("Error deleting comment: ", error);
                alert("There was an error deleting the comment. Please try again.");
            });
        }
    };
    return deleteButton;
}

// Create a like button
function createLikeButton(commentId, likes) {
    const likeButton = document.createElement('button');
    likeButton.textContent = `Like (${likes})`;
    likeButton.dataset.likes = likes;
    likeButton.dataset.liked = 'false';
    likeButton.onclick = function () {
        if (likeButton.dataset.liked === 'false') {
            db.collection('comments').doc(commentId).update({
                likes: firebase.firestore.FieldValue.increment(1)
            }).then(() => {
                likeButton.dataset.liked = 'true';
                likeButton.textContent = `Like (${parseInt(likeButton.dataset.likes) + 1})`;
                likeButton.dataset.likes = parseInt(likeButton.dataset.likes) + 1;
            }).catch(error => {
                console.error("Error liking comment: ", error);
                alert("There was an error liking the comment. Please try again.");
            });
        }
    };
    return likeButton;
}

// Create a reply item element
function createReplyItem(replyData) {
    const { text, likes } = replyData;

    const replyItem = document.createElement('li');
    replyItem.classList.add('reply');
    replyItem.innerHTML = `<div class="comment-text">${text}</div>`;

    const replyFooter = document.createElement('div');
    replyFooter.classList.add('comment-footer');

    const likeButton = createLikeButtonForReply(likes);
    replyFooter.appendChild(likeButton);

    replyItem.appendChild(replyFooter);

    return replyItem;
}

// Create a like button for replies
function createLikeButtonForReply(likes) {
    const likeButton = document.createElement('button');
    likeButton.textContent = `Like (${likes})`;
    likeButton.dataset.likes = likes;
    likeButton.dataset.liked = 'false';
    likeButton.onclick = function () {
        if (likeButton.dataset.liked === 'false') {
            likeButton.dataset.liked = 'true';
            likeButton.textContent = `Like (${parseInt(likeButton.dataset.likes) + 1})`;
            likeButton.dataset.likes = parseInt(likeButton.dataset.likes) + 1;
            // Future functionality to update likes count in Firestore can be added here.
        }
    };
    return likeButton;
}
function updateChartForSelectedMonth() {
    const monthDropdown = document.getElementById('monthDropdown');
    const selectedMonth = monthDropdown.value.toLowerCase(); // Convert selected month to lowercase
    const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const monthIndex = monthNames.indexOf(selectedMonth);

    if (monthIndex === -1) {
        console.error("Invalid month selected.");
        return;
    }

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
                data: [], // Data will be populated dynamically
                backgroundColor: 'rgba(255, 99, 142, 0.6)',
                borderColor: 'rgba(255, 99, 142, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Rating (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Service Areas'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

function updateDashboardChart(averages) {
    if (!window.ratingsChart) {
        console.error("Chart not initialized.");
        return;
    }

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
        acc.labRating += rating.labRating || 0;
        acc.printerRating += rating.printerRating || 0;
        acc.studyRoomRating += rating.studyRoomRating || 0;
        acc.laundryRoomRating += rating.laundryRoomRating || 0;
        acc.receptionStaffRating += rating.receptionStaffRating || 0;
        acc.subwardenAssistanceRating += rating.subwardenAssistanceRating || 0;
        acc.uctShuttlePunctualityRating += rating.uctShuttlePunctualityRating || 0;
        acc.cpsAssistanceRating += rating.cpsAssistanceRating || 0;
        acc.otherRating += rating.otherRating || 0;
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
























































