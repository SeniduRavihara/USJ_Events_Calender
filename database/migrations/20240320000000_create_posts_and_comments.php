<?php

use Phinx\Migration\AbstractMigration;

class CreatePostsAndComments extends AbstractMigration
{
    public function change()
    {
        // Create posts table
        $posts = $this->table('posts');
        $posts->addColumn('user_id', 'integer', ['null' => false])
            ->addColumn('title', 'string', ['limit' => 255, 'null' => false])
            ->addColumn('content', 'text', ['null' => false])
            ->addColumn('created_at', 'datetime', ['null' => false])
            ->addColumn('updated_at', 'datetime', ['null' => false])
            ->addForeignKey('user_id', 'users', 'id', ['delete' => 'CASCADE'])
            ->create();

        // Create comments table
        $comments = $this->table('comments');
        $comments->addColumn('user_id', 'integer', ['null' => false])
            ->addColumn('post_id', 'integer', ['null' => false])
            ->addColumn('content', 'text', ['null' => false])
            ->addColumn('created_at', 'datetime', ['null' => false])
            ->addColumn('updated_at', 'datetime', ['null' => false])
            ->addForeignKey('user_id', 'users', 'id', ['delete' => 'CASCADE'])
            ->addForeignKey('post_id', 'posts', 'id', ['delete' => 'CASCADE'])
            ->create();
    }
}
