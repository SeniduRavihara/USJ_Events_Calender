<?php
require_once '../config/db.php';
header("Content-Type: application/json");

// Enable CORS if needed
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Require authentication for viewing events
require_once '../vendor/firebase/php-jwt/src/JWT.php';
require_once '../vendor/firebase/php-jwt/src/Key.php';

$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// Extract token from Authorization header
$authHeader = $headers['Authorization'];
if (strpos($authHeader, 'Bearer ') === 0) {
    $token = substr($authHeader, 7);
} else {
    $parts = explode(' ', $authHeader, 2);
    $token = isset($parts[1]) ? $parts[1] : '';
}

if (!$token) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
    exit;
}

try {
    $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($_ENV['JWT_SECRET'], 'HS256'));
    // $userId = $decoded->data->id; // Not used for public events but available if needed
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
    exit;
}

try {
    // Select all fields including cover_image and any registration count if available
    $sql = "SELECT * FROM events WHERE event_date >= CURDATE() ORDER BY event_date ASC, event_time ASC";
    $stmt = $pdo->query($sql);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the data for better frontend consumption
    $formattedEvents = array_map(function ($event) {
        // Format date and time
        if ($event['event_date']) {
            $date = new DateTime($event['event_date']);
            $event['formatted_date'] = $date->format('M j, Y');
            $event['formatted_day'] = $date->format('D');
        }

        if ($event['event_time']) {
            $time = DateTime::createFromFormat('H:i:s', $event['event_time']);
            if ($time) {
                $event['formatted_time'] = $time->format('g:i A');
            } else {
                $event['formatted_time'] = $event['event_time'];
            }
        }

        // Ensure registration fields are properly typed
        $event['registration_needed'] = (bool)$event['registration_needed'];

        // Handle cover_image path
        if (!empty($event['cover_image'])) {
            $event['cover_image'] = ltrim($event['cover_image'], './');
        }

        return $event;
    }, $events);

    echo json_encode($formattedEvents);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
