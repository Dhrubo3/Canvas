package com.dhrubo.cse327;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

public class Dashboard extends AppCompatActivity {

CardView cardHome;
    CardView cardNotification;
    CardView cardMark;
    CardView cardMarkSheet;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        cardHome = findViewById(R.id.cardHome);
        cardNotification = findViewById(R.id.cardNotification);
        cardMark = findViewById(R.id.cardMark);
        cardMarkSheet = findViewById(R.id.cardMarkSheet);

        cardHome.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
          showToast("Chat Clicked");
                Intent intent2 = new Intent(Dashboard.this,ProfileActivity.class);
                startActivity(intent2);
            }
        });
  }
  private void showToast(String message){
      Toast.makeText(this,message,Toast.LENGTH_SHORT).show();
  }
}
