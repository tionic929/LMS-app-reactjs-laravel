<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Announcements>
 */
class AnnouncementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $faker = \Faker\Factory::create('tl_PH'); // change language here

        return [
            'title' => fake()->realText(10),
            'content' => fake()->realText(50),
            'type' => fake()->randomElement(['info', 'warning', 'success', 'error', 'maintenance']),
            'created_by' => fake()->numberBetween(1, 10),
        ];
    }
}
