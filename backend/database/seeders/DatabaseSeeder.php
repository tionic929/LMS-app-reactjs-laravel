<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test users
        User::create([
            'name' => 'Test Learner',
            'email' => 'learner@example.com',
            'password' => bcrypt('password'),
            'role' => 'learner',
        ]);

        // Call other seeders
        $this->call([
            CourseSeeder::class,
        ]);
    }
}
