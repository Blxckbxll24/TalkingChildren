package com.talkingchildren

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class AudioRecorderActivity : AppCompatActivity() {
    
    private lateinit var audioManager: AudioManager
    private lateinit var messageText: TextView
    private lateinit var statusText: TextView
    private lateinit var recordButton: Button
    private lateinit var playButton: Button
    
    private var categoryId: Int = -1
    private var messageIndex: Int = -1
    private var messageString: String = ""
    
    private var isRecording = false
    private var isPlaying = false
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_recorder)
        
        audioManager = AudioManager(this)
        
        // Get data from intent
        categoryId = intent.getIntExtra("category_id", -1)
        messageIndex = intent.getIntExtra("message_index", -1)
        messageString = intent.getStringExtra("message_text") ?: ""
        
        if (categoryId == -1 || messageIndex == -1) {
            finish()
            return
        }
        
        setupViews()
        updateUI()
    }
    
    private fun setupViews() {
        messageText = findViewById(R.id.tvMessage)
        statusText = findViewById(R.id.tvStatus)
        recordButton = findViewById(R.id.btnRecord)
        playButton = findViewById(R.id.btnPlay)
        
        messageText.text = messageString
        
        recordButton.setOnClickListener {
            if (isRecording) {
                stopRecording()
            } else {
                startRecording()
            }
        }
        
        playButton.setOnClickListener {
            if (isPlaying) {
                stopPlayback()
            } else {
                startPlayback()
            }
        }
    }
    
    private fun updateUI() {
        val hasRecording = audioManager.hasRecording(categoryId, messageIndex)
        playButton.isEnabled = hasRecording && !isRecording
        
        when {
            isRecording -> {
                recordButton.text = getString(R.string.stop_recording)
                statusText.text = getString(R.string.recording)
                statusText.visibility = TextView.VISIBLE
                playButton.isEnabled = false
            }
            isPlaying -> {
                playButton.text = getString(R.string.stop_recording)
                statusText.text = getString(R.string.playing)
                statusText.visibility = TextView.VISIBLE
                recordButton.isEnabled = false
            }
            else -> {
                recordButton.text = getString(R.string.record_audio)
                playButton.text = getString(R.string.play_audio)
                statusText.visibility = TextView.GONE
                recordButton.isEnabled = true
                playButton.isEnabled = hasRecording
            }
        }
    }
    
    private fun startRecording() {
        if (audioManager.startRecording(categoryId, messageIndex)) {
            isRecording = true
            updateUI()
        }
    }
    
    private fun stopRecording() {
        audioManager.stopRecording()
        isRecording = false
        updateUI()
    }
    
    private fun startPlayback() {
        if (audioManager.startPlayback(categoryId, messageIndex, onComplete = {
                // Callback when playback completes
                runOnUiThread {
                    isPlaying = false
                    updateUI()
                }
            })) {
            isPlaying = true
            updateUI()
        }
    }
    
    private fun stopPlayback() {
        audioManager.stopPlayback()
        isPlaying = false
        updateUI()
    }
    
    override fun onPause() {
        super.onPause()
        if (isRecording) {
            stopRecording()
        }
        if (isPlaying) {
            stopPlayback()
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        audioManager.cleanup()
    }
}