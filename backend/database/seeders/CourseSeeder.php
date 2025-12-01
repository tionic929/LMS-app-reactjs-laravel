<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create an instructor
        $instructor = User::where('role', 'instructor')->first();
        
        if (!$instructor) {
            $instructor = User::create([
                'name' => 'John Doe',
                'email' => 'instructor@example.com',
                'password' => bcrypt('password'),
                'role' => 'instructor',
            ]);
        }

        // Create sample courses
        Course::create([
            'instructor_id' => $instructor->id,
            'title' => 'Web Development Fundamentals',
            'content' => 'Learn HTML, CSS, JavaScript, and the latest web development technologies in our comprehensive bootcamp',
            'privacy' => 'public',
            'capacity' => 50,
            'current_enrolled' => 23,
            'status' => 'active',
        ]);

        Course::create([
            'instructor_id' => $instructor->id,
            'title' => 'Tech Enthusiasts Hub',
            'content' => 'A comprehensive course covering the latest trends in technology and software development',
            'privacy' => 'public',
            'capacity' => 100,
            'current_enrolled' => 15,
            'status' => 'active',
        ]);

        Course::create([
            'instructor_id' => $instructor->id,
            'title' => 'Advanced React Development',
            'content' => 'We have added a new advanced React course to help you deepen your understanding and skills',
            'privacy' => 'private',
            'capacity' => 30,
            'current_enrolled' => 10,
            'status' => 'active',
        ]);

        Course::create([
            'instructor_id' => $instructor->id,
            'title' => 'Python for Data Science',
            'content' => 'Master Python programming with focus on data analysis, visualization, and machine learning',
            'privacy' => 'public',
            'capacity' => 60,
            'current_enrolled' => 45,
            'status' => 'active',
        ]);

        Course::create([
            'instructor_id' => $instructor->id,
            'title' => 'Mobile App Development',
            'content' => 'Build native mobile applications for iOS and Android using React Native',
            'privacy' => 'public',
            'capacity' => 40,
            'current_enrolled' => 32,
            'status' => 'active',
        ]);
    }
}
