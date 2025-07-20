<?php
require_once '../vendor/firebase/php-jwt/src/JWT.php';
require_once '../vendor/firebase/php-jwt/src/Key.php';
require_once '../config/db.php';

header("Content-Type: application/json");

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
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare('SELECT name, email, department, student_id FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(404);
            echo json_encode(["error" => "User not found"]);
            exit;
        }

        // Rename student_id to studentId for frontend compatibility
        $user['studentId'] = $user['student_id'];
        unset($user['student_id']);

        echo json_encode($user);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error"]);
    }
} elseif ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $department = trim($input['department'] ?? '');
        $studentId = trim($input['studentId'] ?? '');

        if (!$name || !$email) {
            http_response_code(400);
            echo json_encode(["error" => "Name and email are required"]);
            exit;
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid email format"]);
            exit;
        }

        $stmt = $pdo->prepare('UPDATE users SET name = ?, email = ?, department = ?, student_id = ? WHERE id = ?');
        $success = $stmt->execute([$name, $email, $department, $studentId, $userId]);

        if (!$success) {
            http_response_code(500);
            echo json_encode(["error" => "Database update failed"]);
            exit;
        }

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["error" => "User not found or no changes made"]);
            exit;
        }

        echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Update failed"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>