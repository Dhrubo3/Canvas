package com.dhrubo.cse327;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.firebase.auth.FirebaseAuth;

public class ProfileActivity extends AppCompatActivity  {

    Button logoutBtn;
    TextView userName,userEmail;
    ImageView profileImage;
    private GoogleApiClient googleApiClient;
    private GoogleSignInOptions gso;
    private Button move;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        logoutBtn=(Button)findViewById(R.id.logoutBtn);
        userName=(TextView)findViewById(R.id.name);
        userEmail=(TextView)findViewById(R.id.email);
        profileImage=(ImageView)findViewById(R.id.profileImage);
        move = (Button)findViewById(R.id.dashboardBtn);

        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        userName.setText(account.getDisplayName());
        userEmail.setText(account.getEmail());
        Glide.with(this).load(account.getPhotoUrl()).into(profileImage);

        logoutBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FirebaseAuth.getInstance().signOut();
                startActivity(new Intent(getApplicationContext(),MainActivity.class));
                finish();
            }
        });



       move.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
               Intent intent1 = new Intent(ProfileActivity.this,Dashboard.class);
               startActivity(intent1);
            }
        });
//
//        logoutBtn.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//                Auth.GoogleSignInApi.signOut(googleApiClient).setResultCallback(
//                        new ResultCallback<Status>() {
//                            @Override
//                            public void onResult(Status status) {
//                                if (status.isSuccess()){
//                                    gotoMainActivity();
//                                }else{
//                                    Toast.makeText(getApplicationContext(),"Session not close", Toast.LENGTH_LONG).show();
//                                }
//                            }
//                        });
//            }
//        });
   }
//
//    @Override
//    protected void onStart() {
//        super.onStart();
//        OptionalPendingResult<GoogleSignInResult> opr= Auth.GoogleSignInApi.silentSignIn(googleApiClient);
//        if(opr.isDone()){
//            GoogleSignInResult result=opr.get();
//            handleSignInResult(result);
//        }else{
//            opr.setResultCallback(new ResultCallback<GoogleSignInResult>() {
//                @Override
//                public void onResult(@NonNull GoogleSignInResult googleSignInResult) {
//                    handleSignInResult(googleSignInResult);
//                }
//            });
//        }
//    }
//
//    private void handleSignInResult(GoogleSignInResult result){
//        if(result.isSuccess()){
//            GoogleSignInAccount account=result.getSignInAccount();
//            userName.setText(account.getDisplayName());
//            userEmail.setText(account.getEmail());
//
//            Picasso.get().load(account.getPhotoUrl()).placeholder(R.mipmap.ic_launcher).into(profileImage);
//        }else{
//            gotoMainActivity();
//        }
//    }
//
//    private void gotoMainActivity(){
//        Intent intent=new Intent(this,MainActivity.class);
//        startActivity(intent);
//    }
//
//    @Override
//    public void onConnectionFailed(@NonNull ConnectionResult connectionResult) {
//
//    }
}
