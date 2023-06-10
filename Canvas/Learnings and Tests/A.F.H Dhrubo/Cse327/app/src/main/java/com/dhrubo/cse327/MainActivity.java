package com.dhrubo.cse327;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.SignInButton;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GoogleAuthProvider;

public class MainActivity extends AppCompatActivity  {
//implements GoogleApiClient.OnConnectionFailedListener
    SignInButton signInButton;
    private GoogleApiClient googleApiClient;
    GoogleSignInClient mGoogleSignInClient;
    ImageView imageView;
    private static final int RC_SIGN_IN = 101;
    private FirebaseAuth mAuth;


    @Override
    public void onStart() {
        super.onStart();
        FirebaseUser currentUser = mAuth.getCurrentUser();
        if(currentUser != null)
            startActivity(new Intent(getApplicationContext(),ProfileActivity.class));
    }





    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        signInButton=(SignInButton)findViewById(R.id.sign_in_button);
        mAuth = FirebaseAuth.getInstance();

//        GoogleSignInOptions gso =  new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
//                .requestEmail()
//                .build();
//        googleApiClient=new GoogleApiClient.Builder(this)
//                .enableAutoManage(this,this)
//                .addApi(Auth.GOOGLE_SIGN_IN_API,gso)
//                .build();
//
        processrequest();

        signInButton.setOnClickListener(new View.OnClickListener() {
           @Override
            public void onClick(View view) {
////               FirebaseFirestore db = FirebaseFirestore.getInstance();
////                DatabaseReference root = db.getReference();
//                Intent intent = Auth.GoogleSignInApi.getSignInIntent(googleApiClient);
//                startActivityForResult(intent,RC_SIGN_IN);
//
               processlogin();
            }
        });

    }



    private void processrequest(){
        GoogleSignInOptions gso =  new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.default_web_client_id))
                .requestEmail()
               .build();

        mGoogleSignInClient = GoogleSignIn.getClient(this,gso);
    }
    private void processlogin() {
        Intent signInIentent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(signInIentent,101);
    }

   @Override
   protected void onActivityResult(int requestCode, int resultCode, Intent data) {
       super.onActivityResult(requestCode, resultCode, data);
       if(requestCode==101){

           Task<GoogleSignInAccount>task = GoogleSignIn.getSignedInAccountFromIntent(data);
           try {
               GoogleSignInAccount account = task.getResult(ApiException.class);
//               Log.d(Tag,"firebaseAuthWithGoogle:" + account.getId());
               firebaseAuthWithGoogle(account.getIdToken());
           }catch (ApiException e){
//               Log.w(Tag,"Google sign in failed",e);
               Toast.makeText(getApplicationContext(),"Error in getting google's Information",Toast.LENGTH_LONG).show();
           }
           }
       }

    private void firebaseAuthWithGoogle(String idToken) {
        AuthCredential credential = GoogleAuthProvider.getCredential(idToken,null);
        mAuth.signInWithCredential(credential)
                .addOnCompleteListener(this, new OnCompleteListener<AuthResult>() {
                    @Override
                    public void onComplete(@NonNull Task<AuthResult> task) {
                        if (task.isSuccessful()){
//                            Log.d(TAG,"SignInWithCredential;sucess");
                            FirebaseUser user = mAuth.getCurrentUser();
//                            updateUI(user);
                            startActivity(new Intent(getApplicationContext(),ProfileActivity.class));
                            finish();
                        }else
                        {
//                            Log.w(TAG,"SigninWithcredential:failure",task.getException());
//                            updateUi(null);
                            Toast.makeText(getApplicationContext(),"Problem found in Firebase login",Toast.LENGTH_LONG).show();
                        }
                    }
                });
    }
//            GoogleSignInResult result = Auth.GoogleSignInApi.getSignInResultFromIntent(data);
//            handleSignInResult(result);
//
//
//        }
//    }

//    private void handleSignInResult(GoogleSignInResult result){
//        if(result.isSuccess()){
//            gotoProfile();
//        }else{
//            Toast.makeText(getApplicationContext(),"Sign in cancel",Toast.LENGTH_LONG).show();
//        }
//    }

//    private void gotoProfile(){
//        Intent intent=new Intent(MainActivity.this,ProfileActivity.class);
//        startActivity(intent);
//    }
//
//    @Override
//    public void onConnectionFailed(@NonNull ConnectionResult connectionResult) {
//
//    }
}
