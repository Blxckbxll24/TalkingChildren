package com.talkingchildren

import android.content.Context
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.os.Build
import java.io.File
import java.io.IOException

class AudioManager(private val context: Context) {
    
    private var mediaRecorder: MediaRecorder? = null
    private var mediaPlayer: MediaPlayer? = null
    private var currentAudioFile: String? = null
    
    companion object {
        private const val AUDIO_DIR = "TalkingChildren"
        private const val AUDIO_EXTENSION = ".3gp"
    }
    
    data class Category(val id: Int, val name: String, val messages: List<String>)
    
    fun getCategories(): List<Category> {
        return listOf(
            Category(0, context.getString(R.string.category_basic), listOf(
                context.getString(R.string.msg_basic_hello),
                context.getString(R.string.msg_basic_help),
                context.getString(R.string.msg_basic_thanks)
            )),
            Category(1, context.getString(R.string.category_emotions), listOf(
                context.getString(R.string.msg_emotion_happy),
                context.getString(R.string.msg_emotion_support),
                context.getString(R.string.msg_emotion_grateful)
            )),
            Category(2, context.getString(R.string.category_needs), listOf(
                context.getString(R.string.msg_need_bathroom),
                context.getString(R.string.msg_need_hungry),
                context.getString(R.string.msg_need_thirsty)
            ))
        )
    }
    
    private fun getAudioDir(): File {
        val audioDir = File(context.filesDir, AUDIO_DIR)
        if (!audioDir.exists()) {
            audioDir.mkdirs()
        }
        return audioDir
    }
    
    fun getAudioFilePath(categoryId: Int, messageIndex: Int): String {
        val fileName = "cat_${categoryId}_msg_${messageIndex}$AUDIO_EXTENSION"
        return File(getAudioDir(), fileName).absolutePath
    }
    
    fun hasRecording(categoryId: Int, messageIndex: Int): Boolean {
        val filePath = getAudioFilePath(categoryId, messageIndex)
        return File(filePath).exists()
    }
    
    fun startRecording(categoryId: Int, messageIndex: Int): Boolean {
        return try {
            val filePath = getAudioFilePath(categoryId, messageIndex)
            currentAudioFile = filePath
            
            mediaRecorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(context)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }.apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP)
                setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB)
                setOutputFile(filePath)
                
                prepare()
                start()
            }
            true
        } catch (e: IOException) {
            e.printStackTrace()
            false
        }
    }
    
    fun stopRecording() {
        mediaRecorder?.apply {
            try {
                stop()
                release()
            } catch (e: RuntimeException) {
                e.printStackTrace()
            }
        }
        mediaRecorder = null
    }
    
    fun startPlayback(categoryId: Int, messageIndex: Int, onComplete: (() -> Unit)? = null): Boolean {
        return try {
            val filePath = getAudioFilePath(categoryId, messageIndex)
            if (!File(filePath).exists()) {
                return false
            }
            
            mediaPlayer = MediaPlayer().apply {
                setDataSource(filePath)
                prepare()
                setOnCompletionListener {
                    onComplete?.invoke()
                }
                start()
            }
            true
        } catch (e: IOException) {
            e.printStackTrace()
            false
        }
    }
    
    fun stopPlayback() {
        mediaPlayer?.apply {
            if (isPlaying) {
                stop()
            }
            release()
        }
        mediaPlayer = null
    }
    
    fun isRecording(): Boolean = mediaRecorder != null
    
    fun isPlaying(): Boolean = mediaPlayer?.isPlaying == true
    
    fun cleanup() {
        stopRecording()
        stopPlayback()
    }
}