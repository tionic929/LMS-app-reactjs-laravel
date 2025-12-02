<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // 💡 CRITICAL for background processing
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class SendSocketNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $targetType;
    protected $targetId;
    protected $message;
    protected $type;
    protected $link;

    public function __construct($targetType, $targetId, $message, $type, $link)
    {
        $this->targetType = $targetType;
        $this->targetId = $targetId;
        $this->message = $message;
        $this->type = $type;
        $this->link = $link;
    }

    /**
     * Execute the job to push the notification to the socket server.
     */
    public function handle(): void
    {
        // 💡 This runs in the background.
        Http::post("http://localhost:3000/api/relay", [
            "room"     => "{$this->targetType}:{$this->targetId}",
            "message"  => $this->message,
            "type"     => $this->type,
            "link_url" => $this->link,
        ]);
    }
}