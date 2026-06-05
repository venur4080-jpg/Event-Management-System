<?php
session_start();

if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header("Location: index.php");
    exit;
}

// BCA Events Data (Server Side)
$events = [
    ["title" => "TechNova Codeathon", "date" => "Mar 15, 2024", "desc" => "24-hour intense coding marathon. Solve real-world problems.", "price" => "Free", "color" => "#4facfe"],
    ["title" => "AI & ML Summit", "date" => "Mar 20, 2024", "desc" => "Explore the future of Artificial Intelligence with industry experts.", "price" => "$10", "color" => "#00f2fe"],
    ["title" => "Cyber Shield 2024", "date" => "Mar 25, 2024", "desc" => "Ethical Hacking workshop. Learn how to secure modern apps.", "price" => "$15", "color" => "#ff0055"],
    ["title" => "WebMosaic UI/UX", "date" => "Apr 02, 2024", "desc" => "Design and build competition. Best UI takes the prize.", "price" => "Free", "color" => "#ff9a9e"],
    ["title" => "CloudCom Azure", "date" => "Apr 10, 2024", "desc" => "Hands-on workshop on Cloud Computing with Microsoft Azure.", "price" => "$5", "color" => "#a18cd1"],
    ["title" => "Data Science Dive", "date" => "Apr 15, 2024", "desc" => "Big Data analytics and visualization techniques using Python.", "price" => "$20", "color" => "#fbc2eb"],
    ["title" => "Gaming Arena (CS2)", "date" => "Apr 20, 2024", "desc" => "Inter-college E-sports tournament. 5v5 Tactical Shooter.", "price" => "$5/Team", "color" => "#8fd3f4"],
    ["title" => "AppVentures Mobile", "date" => "Apr 25, 2024", "desc" => "Flutter & React Native workshop for cross-platform apps.", "price" => "$10", "color" => "#84fab0"],
    ["title" => "IoT Systems Expo", "date" => "May 05, 2024", "desc" => "Showcase your Arduino and Raspberry Pi projects.", "price" => "Free", "color" => "#fa709a"],
    ["title" => "RoboRumble", "date" => "May 10, 2024", "desc" => "Line follower and obstacle avoider bot competition.", "price" => "$15", "color" => "#fee140"],
    ["title" => "Blockchain Basics", "date" => "May 15, 2024", "desc" => "Introduction to Web3, Smart Contracts, and Crypto.", "price" => "$10", "color" => "#667eea"],
    ["title" => "Tech QuizWhiz", "date" => "May 20, 2024", "desc" => "Test your knowledge on latest tech trends and coding history.", "price" => "Free", "color" => "#30cfd0"],
    ["title" => "Startup Pitch", "date" => "May 28, 2024", "desc" => "Pitch your innovative text ideas to investors and alumni.", "price" => "Free", "color" => "#f093fb"],
    ["title" => "Networking Night", "date" => "Jun 01, 2024", "desc" => "Alumni meet and greet. Build your professional network.", "price" => "$25", "color" => "#c471ed"],
    ["title" => "Full Stack Fest", "date" => "Jun 10, 2024", "desc" => "MERN Stack deep dive workshop for final year students.", "price" => "$30", "color" => "#f6d365"]
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard | BCA Events</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- Navigation -->
    <nav class="navbar">
        <div class="logo">BCA<span>Events</span></div>
        <div class="nav-links">
            <span style="margin-right: 15px; color: var(--text-muted);">Hello, <?php echo htmlspecialchars($_SESSION['username']); ?></span>
            <button onclick="window.location.href='logout.php'">Logout</button>
        </div>
    </nav>

    <!-- Hero Section -->
    <header class="hero-section">
        <h1 class="hero-title">Experience the Future<br>of Technology</h1>
        <p class="hero-subtitle">Discover and register for exclusive seminars, hackathons, and workshops designed for the next generation of developers.</p>
    </header>

    <!-- Events Grid -->
    <main>
        <div class="events-grid">
            <?php foreach ($events as $event): ?>
            <div class="glass-panel event-card">
                <div class="card-image-placeholder" style="background: linear-gradient(135deg, <?php echo $event['color']; ?>44, #1e293b)">
                    <div class="date-badge"><?php echo $event['date']; ?></div>
                </div>
                <div class="card-content">
                    <h3 class="event-title"><?php echo htmlspecialchars($event['title']); ?></h3>
                    <p class="event-desc"><?php echo htmlspecialchars($event['desc']); ?></p>
                    <div class="card-footer">
                        <span class="price-tag"><?php echo $event['price']; ?></span>
                        <button class="register-btn-sm" onclick="registerEvent('<?php echo addslashes($event['title']); ?>')">Register</button>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </main>

    <script src="script.js"></script>
</body>
</html>
