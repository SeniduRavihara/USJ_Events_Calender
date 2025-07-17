<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class UpdateUsersTable extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('users');

        if (!$table->hasColumn('department')) {
            $table->addColumn('department', 'string', ['limit' => 100]);
        }

        if (!$table->hasColumn('student_id')) {
            $table->addColumn('student_id', 'string', ['limit' => 20]);
        }

        if (!$table->hasColumn('email_verified')) {
            $table->addColumn('email_verified', 'boolean', ['default' => false]);
        }

        if (!$table->hasColumn('is_active')) {
            $table->addColumn('is_active', 'boolean', ['default' => true]);
        }

        if (!$table->hasColumn('created_at')) {
            $table->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP']);
        }

        if (!$table->hasColumn('updated_at')) {
            $table->addColumn('updated_at', 'timestamp', [
                'default' => 'CURRENT_TIMESTAMP',
                'update' => 'CURRENT_TIMESTAMP'
            ]);
        }

        if (!$table->hasIndex(['student_id'])) {
            $table->addIndex(['student_id'], ['unique' => true]);
        }

        if (!$table->hasIndex(['department'])) {
            $table->addIndex(['department']);
        }

        // Important: always call update() when modifying existing tables
        $table->update();
    }
}
