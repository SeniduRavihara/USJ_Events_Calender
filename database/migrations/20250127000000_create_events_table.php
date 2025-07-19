<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateEventsTable extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change(): void
    {
        $table = $this->table('events');
        $table->addColumn('user_id', 'integer', ['null' => false])
            ->addColumn('title', 'string', ['limit' => 255, 'null' => false])
            ->addColumn('cover_image', 'string', ['limit' => 500, 'null' => true])
            ->addColumn('cover_color', 'string', ['limit' => 50, 'null' => true])
            ->addColumn('event_date', 'date', ['null' => false])
            ->addColumn('event_time', 'time', ['null' => false])
            ->addColumn('location', 'string', ['limit' => 255, 'null' => false])
            ->addColumn('departments', 'text', ['null' => false])
            ->addColumn('description', 'text', ['null' => true])
            ->addColumn('registration_needed', 'boolean', ['default' => false, 'null' => false])
            ->addColumn('registration_link', 'string', ['limit' => 500, 'null' => true])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'null' => false])
            ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'null' => false])
            ->addIndex(['user_id'])
            ->addIndex(['event_date'])
            ->addIndex(['departments'])
            ->create();
    }
}
