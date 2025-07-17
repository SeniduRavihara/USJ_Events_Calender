<?php
require_once '../vendor/firebase/php-jwt/src/JWT.php';
require_once '../vendor/firebase/php-jwt/src/Key.php';
require_once '../config/db.php';

header("Content-Type: application/json");

// Verify JWT token
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

list(, $token) = explode(' ', $headers['Authorization']);

try {
    $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($_ENV['JWT_SECRET'], 'HS256'));
    $userId = $decoded->data->id;

    // Helper to get POST data (JSON or form)
    function get_post_data()
    {
        if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
            return json_decode(file_get_contents('php://input'), true);
        }
        return $_POST;
    }

    $data = get_post_data();

    // Required fields
    $title = trim($data['event-title'] ?? $data['title'] ?? '');
    $event_date = trim($data['event-date'] ?? $data['event_date'] ?? '');
    $event_time = trim($data['event-time'] ?? $data['event_time'] ?? '');
    $location = trim($data['event-location'] ?? $data['location'] ?? '');
    $departments = $data['department'] ?? $data['departments'] ?? [];
    if (is_string($departments)) {
        $departments = [$departments];
    }
    $departments_str = json_encode($departments);

    // Optional fields
    $description = trim($data['event-description'] ?? $data['description'] ?? '');
    $cover_color = trim($data['cover-color'] ?? $data['cover_color'] ?? '');
    $registration_needed = ($data['registration-needed'] ?? $data['registration_needed'] ?? 'no') === 'yes' ? 1 : 0;
    $registration_link = trim($data['registration-link'] ?? $data['registration_link'] ?? '');

    // Handle file upload (cover image)
    $cover_image_path = null;
    if (isset($_FILES['cover-image']) && $_FILES['cover-image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../uploads/event-covers/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        $ext = pathinfo($_FILES['cover-image']['name'], PATHINFO_EXTENSION);
        $filename = uniqid('event_', true) . '.' . $ext;
        $target = $upload_dir . $filename;
        if (move_uploaded_file($_FILES['cover-image']['tmp_name'], $target)) {
            $cover_image_path = 'uploads/event-covers/' . $filename;
        }
    }

    // Validate required fields
    if (empty($title) || empty($event_date) || empty($event_time) || empty($location) || empty($departments)) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    // Insert event
    $stmt = $pdo->prepare("INSERT INTO events (user_id, title, cover_image, cover_color, event_date, event_time, location, departments, description, registration_needed, registration_link, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $stmt->execute([
        $userId,
        $title,
        $cover_image_path,
        $cover_color,
        $event_date,
        $event_time,
        $location,
        $departments_str,
        $description,
        $registration_needed,
        $registration_link
    ]);

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Event created successfully",
        "event_id" => $pdo->lastInsertId()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
}
