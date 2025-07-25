package com.talkingchildren

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup

class MessagesActivity : AppCompatActivity() {
    
    private lateinit var audioManager: AudioManager
    private lateinit var recyclerView: RecyclerView
    private lateinit var categoryTitle: TextView
    private lateinit var messageAdapter: MessageAdapter
    
    private var categoryId: Int = -1
    private var categoryName: String = ""
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_messages)
        
        audioManager = AudioManager(this)
        
        // Get data from intent
        categoryId = intent.getIntExtra("category_id", -1)
        categoryName = intent.getStringExtra("category_name") ?: ""
        
        if (categoryId == -1) {
            finish()
            return
        }
        
        setupViews()
    }
    
    private fun setupViews() {
        categoryTitle = findViewById(R.id.tvCategoryTitle)
        recyclerView = findViewById(R.id.recyclerMessages)
        
        categoryTitle.text = categoryName
        recyclerView.layoutManager = LinearLayoutManager(this)
        
        val categories = audioManager.getCategories()
        val category = categories.find { it.id == categoryId }
        
        if (category != null) {
            messageAdapter = MessageAdapter(category.messages, categoryId) { messageIndex, messageText ->
                val intent = Intent(this, AudioRecorderActivity::class.java)
                intent.putExtra("category_id", categoryId)
                intent.putExtra("message_index", messageIndex)
                intent.putExtra("message_text", messageText)
                startActivity(intent)
            }
            
            recyclerView.adapter = messageAdapter
        } else {
            finish()
        }
    }
    
    override fun onResume() {
        super.onResume()
        // Refresh the adapter to show updated recording status
        messageAdapter.notifyDataSetChanged()
    }
    
    override fun onDestroy() {
        super.onDestroy()
        audioManager.cleanup()
    }
}

class MessageAdapter(
    private val messages: List<String>,
    private val categoryId: Int,
    private val onMessageClick: (Int, String) -> Unit
) : RecyclerView.Adapter<MessageAdapter.MessageViewHolder>() {
    
    class MessageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val messageText: TextView = view.findViewById(R.id.tvMessageText)
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessageViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_message, parent, false)
        return MessageViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: MessageViewHolder, position: Int) {
        val message = messages[position]
        val audioManager = AudioManager(holder.itemView.context)
        
        // Show recording status with the message
        val hasRecording = audioManager.hasRecording(categoryId, position)
        val displayText = if (hasRecording) {
            "🎵 $message"
        } else {
            message
        }
        
        holder.messageText.text = displayText
        
        holder.itemView.setOnClickListener {
            onMessageClick(position, message)
        }
    }
    
    override fun getItemCount(): Int = messages.size
}