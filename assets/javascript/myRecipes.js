$(document).ready(function () {
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
 
 //This function checks if you are already signed in 
 function CheckIfSignedIn()
 {
   var cookies = document.cookie.split(";");
   console.log(cookies);
   
   if(cookies[0] != "")
   {
     var username = cookies[0].split("=");
     console.log(username);
     doThiswhenSignedin(username[1]);      
   }
   else
   {
     doThiswhenSignedOut();
   }
 }
 function doThiswhenSignedin(username)
 {
   $("#login-message").text ("Welcome  " + username);
     $("#myRecipes").attr("style","display:inline-block");
     $("#signin").attr("style","display:none");
     $("#sign-out").attr("style","display:inline-block");
     $("#recipeadded-message").text("");
 }
 function doThiswhenSignedOut()
 {
   $("#login-message").text ("");
     $("#myRecipes").attr("style","display:none");
     $("#signin").attr("style","display:inline-block");
     $("#sign-out").attr("style","display:none");
     $("#recipeadded-message").text("Sign in to add to MY Recipes");
 }
 function removeCookie()
 {
   var res = document.cookie;
   var multiple = res.split(";");
   for(var i = 0; i < multiple.length; i++) {
      var key = multiple[i].split("=");
      document.cookie = key[0]+" =; expires = Thu, 01 Jan 1970 00:00:00 UTC";
   }
 }
 function readFromFireBase(category)  
 {
  $("#details-appear-here").empty();
  var cookies = document.cookie.split(";");
  var cookievalues = cookies[1].split("=");
  var uid = cookievalues[1];
// upon successful login, in the callback say uid = result.user.uid
var database = firebase.database();
//  Create Firebase event for adding employee to the database and a row in the html when a user adds an entry 
database.ref(uid).on("child_added", function(childSnapshot) {
//console.log(childSnapshot.val());
// Store everything into a variable.
var recName = childSnapshot.val().recipeName;
var ingredients = childSnapshot.val().ingredients;
var image = childSnapshot.val().imageLink;
var recLink = childSnapshot.val().recipeLink;
var recipeID = childSnapshot.val().recipeID;
var keyinFB = childSnapshot.key;
var recipeCategory = childSnapshot.val().recipeCategory;
//console.log(ingredients);
var divCard = $("<div>").addClass("card main-card");
divCard.attr("style","height: 250px; width: 95%; margin:10px; min-width:95%");
var divCardHeader = $("<div>").addClass("card-header");
var h5CardTitle = $("<h5>").addClass("card-title");
var divCardBody = $("<div>").addClass("card-body");
divCardBody.attr("style", "overflow:auto");
var divrow = $("<div>").addClass("row");
var divcol1 = $("<div>").addClass("col-6");
var divcol2 = $("<div>").addClass("col-3");
var divcol3 = $("<div>").addClass("col-3 text-right");
var deleteButton = $("<button>").addClass("btn btn-info delete-RecipefromFB");
var ulTag = $("<ul>");
var imgTag = $("<img>");
imgTag.attr("style"," height: 200px;");
var recipelinkTag = $("<div>").addClass("card-footer");
var aHref = $("<a>");
var strarr = recLink.split(".com");
//var arrayIngredients = JSON.parse(ingredients,"");
h5CardTitle.text(recName);
aHref.attr("href",recLink);
aHref.text(strarr[0] + "....");  
aHref.attr("target","_blank");
imgTag.attr("src",image);
//console.log(ingredients.length);
for(var i=0;i<ingredients.length;i++)
{
  var liTag = $("<li>");
  liTag.text(ingredients[i]);
  ulTag.append(liTag);
}
deleteButton.text("Delete");
deleteButton.attr("id", keyinFB);
divcol1.append(ulTag);
divcol2.append(imgTag);
divcol3.append(deleteButton);
divrow.append(divcol1);
divrow.append(divcol2);
divrow.append(divcol3);
divCardBody.append(divrow);
divCardHeader.append(h5CardTitle);
divCard.append(divCardHeader);
divCard.append(divCardBody);
recipelinkTag.append("For more details - ");
recipelinkTag.append(aHref);
recipelinkTag.attr("target", "_blank");
divCard.append(recipelinkTag);
console.log(category,recipeCategory);
if((category == "") || (recipeCategory == category))
{
$("#details-appear-here").append(divCard);
}
});
 }
// FB key
var config = {
  apiKey: "AIzaSyBd48dzN-XI4-K8ay8IdXIlkm1__G5_NS8",
  authDomain: "quisine-49ccf.firebaseapp.com",
  databaseURL: "https://quisine-49ccf.firebaseio.com",
  projectId: "quisine-49ccf",
  storageBucket: "quisine-49ccf.appspot.com",
  messagingSenderId: "962399784259"
};
firebase.initializeApp(config);
var database = firebase.database();
$(document).on("click", ".delete-RecipefromFB", function (event) {
  
  var cookies = document.cookie.split(";");
  var uidtopass= "";
   if(cookies[0] != "")
   {
     var username = cookies[0].split("=");
     uid = cookies[1].split("=");
     uidtopass = uid[1];
   }
  database.ref(uidtopass + "/" + $(this).attr("id")).remove();
 // database.ref(uid + "/" + $(this).attr("id")).remove()
  //alert($(this).attr("id"));
  $( this ).parent().parent().parent().parent().attr("class","");
  $( this ).parent().parent().parent().parent().attr("style","height:0px"); 
  $( this ).parent().parent().parent().parent().empty();
});
 //On click sign out clear cookies 
 $("#sign-out").on("click",function(event){
  removeCookie();
  firebase.auth().signOut().then(function(){
   $("#login-message").text ("");
   $("#myRecipes").attr("style","visibility:hidden");
   $("#signin").attr("style","visibility:visible");
   $("#sign-out").attr("style","visibility:hidden");
  });
  location.reload();
 });
 $("#signin").on("click",function(event){
  //Google Authentication
  firebase.auth().signInWithPopup(provider).then(function (result) {
   // This gives you a Google Access Token. You can use it to access the Google API.
   var token = result.credential.accessToken;
   // The signed-in user info.
   var user = result.user;
   console.log(user);
   //authorizedUserSetup(result.user.uid);
   //sessionStorage.setItem("uid", result.user.uid); 
   var username = user.displayName ;
   document.cookie = "username=" + username;
   document.cookie = "uid=" + result.user.uid;
   location.reload();
  
   // ...
 }).catch(function (error) {
   // Handle Errors here.
   var errorCode = error.code;
   var errorMessage = error.message;
   // The email of the user's account used.
   var email = error.email;
   // The firebase.auth.AuthCredential type that was used.
   var credential = error.credential;
   // ...
 });
 
});
 $(".recipe-category").on("click", function (event) {
   readFromFireBase($(this).attr("value"));
 });
//on page load 
  CheckIfSignedIn();
  readFromFireBase("");
});

