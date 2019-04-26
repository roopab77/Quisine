$(document).ready(function () {

  //This is for Google sigin

  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");

  // global variable for FB
  var ingredientsforFB = [];
  var recipeNameforFB = "";
  var recipeLinkforFB = "";
  var imagelinkforFB = "";
  var recipeIDforFB = "";
  var CategoryforFB = "";


  //These are default values for NY city.

  var latitude = 40.7128;
  var longitude = -74.0060;
  var category = "";
  var TopTrendingrecipe = "";

  var signedIn = false;

  //Get current location of the user 
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      //x.innerHTML = "Geolocation is not supported by this browser.";
    }
  }

  //this is used to get the current location of the user 
  function showPosition(position) {
    // x.innerHTML = "Latitude: " + position.coords.latitude +
    //  "<br>Longitude: " + position.coords.longitude;

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

  }

  //Builds query to get the initial recipes based on category
  function buildQueryURL(foodCategory) {
    // queryURL is the url we'll use to query the API

    var appID = "5ed766c5";
    var apiKey = "28992938ae132c1c2a3ed5a1a0bd7a4f";

    var queryURL = "https://api.yummly.com/v1/api/recipes?_app_id=" + appID + "&_app_key=" + apiKey + "&q=" +
      foodCategory + "&allowedCuisine[]cuisine^" + foodCategory;
    //For FB
    CategoryforFB = foodCategory;
    //console.log(queryURL);
    return queryURL;
  }

  //Builds a query to get details of the recipe with recipe ID 
  function buildQueryURLforID(recipeID) {
    var appID = "5ed766c5";
    var apiKey = "28992938ae132c1c2a3ed5a1a0bd7a4f";
    var queryUrlByID = "https://api.yummly.com/v1/api/recipe/" + recipeID + "?_app_id=" + appID + "&_app_key=" +
      apiKey;

    return queryUrlByID;
  }

  //This is the ajax call to yummly with recipeID
  function ajaxtofillIngredients(recipeID)
  { 
    var queryUrlByID = buildQueryURLforID(recipeID);
    $.ajax({
      url: queryUrlByID,
      method: "GET"
    }).then(function (response) {
      //console.log(response);
      GetRecipeDetails(response);
    });

  }

  //On page load fill the  page with top trending recipes and the details of the top recipe 
  function TopTrendingRecipesOnPageLoad() {
    var queryURL = buildQueryURL("trending");
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (matches) {

      updatePage(matches);           
      ajaxtofillIngredients(TopTrendingrecipe);      
    });
  }

  //Get the list of recipes for the specific category selected in the dropdown menu
  function updatePage(RecipeData) {
    if (RecipeData.matches[0] == undefined) {
      searchInput = $("#search-form-input").val().trim();
      $("#recipe-list-ul").text(searchInput + " has no results");
      return false;
    };
    var recipeUl = $("#recipe-list-ul");
    recipeUl.empty();
   
    //console.log("Toptrendingrecipe  " + TopTrendingrecipe);
    for (var i = 0; i < RecipeData.matches.length; i++) {
      var recipeLI = $("<li>");
      var recipelink = $("<a>");
      recipelink.addClass("card-link");
      recipelink.text(RecipeData.matches[i].recipeName);
      recipelink.attr("value", RecipeData.matches[i].id);
      recipelink.attr("href", "#a");
      recipelink.attr("class", "recipe-link");
      recipeLI.attr("value", RecipeData.matches[i].id);
      recipeLI.html(recipelink);
      recipeUl.append(recipeLI);
    }
    TopTrendingrecipe = RecipeData.matches[0].id;
    ajaxtofillIngredients(TopTrendingrecipe);
    LoadRestaurants();
  }

  //Append the ingredients, link to instructions, recipe title and the image 
  function GetRecipeDetails(response) {

    $("#recipe-ingredients").empty();
    $("#recipe-image").empty();
    $(".nutrients-row").empty();
    if (signedIn === true) {
      $("#recipeadded-message").empty();
    } else {
      $("#recipeadded-message").text("Sign in to add to MY Recipes");
    }
    var ingredients = response.ingredientLines;
    $("#recipe-name").text(response.name);
    // For FB
    recipeNameforFB = response.name;
    var recipeInstructions = $("<a>");
    var ingredientUL = $("<ul>");
    var recipeImage = $("<img>");
    for (var i = 0; i < ingredients.length; i++) {
      var ingredientLI = $("<li>");
      ingredientLI.text(ingredients[i]);
      ingredientUL.append(ingredientLI);
      // For FB
      ingredientsforFB.push(ingredients[i]);
    }

    var recipelink = response.source.sourceRecipeUrl;
    //For saving into firebase
    imagelinkforFB = response.images[0].hostedLargeUrl;
    recipeLinkforFB = recipelink;
    recipeInstructions.html('<button class="btn btn-info">Click Here for Recipe Instructions</button>');
    recipeInstructions.attr("href", recipelink);
    recipeInstructions.attr("target", "_blank");
    recipeInstructions.attr("rel", "nofollow");
    recipeImage.attr("src", response.images[0].hostedLargeUrl);
    recipeImage.addClass("img-fluid rounded");
    $("#recipe-ingredients").append(ingredientUL);
  
    $("#recipe-ingredients").append(recipeInstructions);
    $("#recipe-image").append(recipeImage);

    // NUTRITION FACTS BUTTON AND INFO GET----------------
    var nutritionBtn = $("<button>")
    nutritionBtn
      .addClass("btn btn-info")
      .attr({
        "type": "button",
        "data-toggle": "collapse",
        "data-target": "#nutrition-table",
        "aria-expanded": "false",
        "aria-controls": "nutrition-table"
      })
      .text("Nutrition Facts");
    $("#nutrition-btn-container").html(nutritionBtn);

    var nutrients = response.nutritionEstimates;

    for (var i = 0; i < nutrients.length; i++) {
      if (nutrients[i].attribute === "ENERC_KCAL") {
        $("<td>")
          .text("Calories:")
          .appendTo($("#calories"));
        $("<td>")
          .text(Math.round(nutrients[i].value) + " " + nutrients[i].unit.abbreviation)
          .appendTo($("#calories"));
      }

      if (nutrients[i].attribute === "FAT") {
        $("<td>")
          .text("Total Fat:")
          .appendTo($("#fat"));
        $("<td>")
          .text(Math.round(nutrients[i].value) + " " + nutrients[i].unit.abbreviation)
          .appendTo($("#fat"));
      }

      if (nutrients[i].attribute === "CHOLE") {
        $("<td>")
          .text("Cholesterol:")
          .appendTo($("#cholesterol"));
        $("<td>")
          .text(Math.round(nutrients[i].value) + " " + nutrients[i].unit.abbreviation)
          .appendTo($("#cholesterol"));
      }

      if (nutrients[i].attribute === "NA") {
        $("<td>")
          .text("Sodium:")
          .appendTo($("#sodium"));
        $("<td>")
          .text(Math.round(nutrients[i].value) + " " + nutrients[i].unit.abbreviation)
          .appendTo($("#sodium"));
      }

      if (nutrients[i].attribute === "CHOCDF") {
        $("<td>")
          .text("Total Carbohydrates:")
          .appendTo($("#carbs"));
        $("<td>")
          .text(Math.round(nutrients[i].value) + " " + nutrients[i].unit.abbreviation)
          .appendTo($("#carbs"));
      }

      if (nutrients[i].attribute === "FIBTG") {
        $("<td>")
          .text("Dietary Fiber:")
          .appendTo($("#fiber"));
        $("<td>")
          .text(Math.round(nutrients[i].value) + " " + nutrients[i].unit.abbreviation)
          .appendTo($("#fiber"));
      }

      if (nutrients[i].attribute === "SUGAR") {
        $("<td>")
          .text("Total Sugars:")
          .appendTo($("#sugars"));
        $("<td>")
          .text(Math.round(nutrients[i].value) + " " + nutrients[i].unit.abbreviation)
          .appendTo($("#sugars"));
      }

      if (nutrients[i].attribute === "PROCNT") {
        $("<td>")
          .text("Protein:")
          .appendTo($("#protein"));
        $("<td>")
          .text(Math.round(nutrients[i].value) + " " + nutrients[i].unit.abbreviation)
          .appendTo($("#protein"));
      }
    };

  };

  //From the yelp API get the restaurant details 
  function LoadRestaurants() {
    //var foodCategory = $(".recipe-category").attr("value");

    foodCategory = category;
    var queryURL = "https://api.yelp.com/v3/businesses/search?term=" + foodCategory + "&latitude=" + latitude + "&longitude=" + longitude;
    var corsURL = "https://cors-anywhere.herokuapp.com/" + queryURL
    //console.log(corsURL);
    $.ajax({
      url: corsURL,
      method: "GET",
      headers: {
        'Authorization': "Bearer fuVkmZQYUYVOHcZ3I8yKQTuSmfEr8EfaInmXRf2OqTHirXDr_Gb___dWPEnxf6MGaEZd6YtL5V5hIZvgg7zbnBG2GJeCdPG2Tmwm9V2k8lKXYUKz4ODh750gbliuW3Yx"
      }

    }).then(function (response) {
      // console.log(response);
     
      var divRow = $("<div>");
      $("#results-appear-here").empty();
      for (var i = 0; i < 9; i++) {
        var price = "";
        if(response.businesses[i].price != null){price = "Price : " + response.businesses[i].price;}
        
        var divCard = $("<div>").addClass("card rounded");
        var imgtag = $("<img>").addClass("card-img-top img-restaurants");
        var divCardbody = $("<div>").addClass("card-body restaurant-card");
        var pcardtext = $("<p>").addClass("card-text restaurant-name");
        imgtag.attr("src", response.businesses[i].image_url);
        imgtag.attr("style","width:100%");
        divCard.attr( "style","margin:5px");
        pcardtext.append(response.businesses[i].name);
        pcardtext.append("<br/>" + response.businesses[i].location.display_address);
        pcardtext.append("<br/>" + price + "     Rating :" + response.businesses[i].rating);
        //console.log(response.businesses[i].name,response.businesses[i].display_address);
        divCardbody.append(pcardtext);
        divCard.append(imgtag);
        divCard.append(divCardbody);
        $("#results-appear-here").append(divCard);
        //divCol.append(divCard);
        //divRow.append(divCol);
      }



    });
  }

  //If signed in then display the username and the buttons 
  function doThiswhenSignedin(username)
  {
    $("#login-message").text ("Welcome  " + username);
      $("#myRecipes").attr("style","display:inline-block");
      $("#signin").attr("style","display:none");
      $("#sign-out").attr("style","display:inline-block");
      $("#recipeadded-message").text("");
  }

  //Hide some buttons and clear when signed out
  function doThiswhenSignedOut()
  {
    $("#login-message").text ("");
      $("#myRecipes").attr("style","display:none");
      $("#signin").attr("style","display:inline-block");
      $("#sign-out").attr("style","display:none");
      $("#recipeadded-message").text("Sign in to add to MY Recipes");
  }

  //This function checks if you are already signed in 
  function CheckIfSignedIn()
  {
    var cookies = document.cookie.split(";");
    console.log(cookies);
    
    if(cookies[0] != "")
    {
      var username = cookies[0].split("=");
      console.log(username);
      signedIn = true;
      doThiswhenSignedin(username[1]);      
    }
    else
    {
      doThiswhenSignedOut();
    }

  }

  //Removes the cookie on sign out
  function removeCookie()
  {
    var res = document.cookie;
    var multiple = res.split(";");
    for(var i = 0; i < multiple.length; i++) {
       var key = multiple[i].split("=");
       document.cookie = key[0]+" =; expires = Thu, 01 Jan 1970 00:00:00 UTC";
    }
  }

  // GET RECIPE FROM SEARCH FORM IN NAV BAR
  function queryUrlForSearchBar(foodCategory) {
    // queryURL is the url we'll use to query the API

    var appID = "5ed766c5";
    var apiKey = "28992938ae132c1c2a3ed5a1a0bd7a4f";

    var queryURL = "https://api.yummly.com/v1/api/recipes?_app_id=" + appID + "&_app_key=" + apiKey + "&q=" +
      foodCategory;
    //For FB
    CategoryforFB = foodCategory;
    //console.log(queryURL);
    return queryURL;
  }
  // CLICK HANDLERS
  // ==========================================================

  // .on("click") function associated with the dropdown Button
  $(".recipe-category").on("click", function (event) {

    //alert("iam here");
    $("#dropdown-display:first-child").text($(this).text());
    $("#dropdown-display:first-child").val($(this).text());
    event.preventDefault();
    //$("#recipe-details").empty();

    category = $(this).attr("value");

    var queryURL = buildQueryURL(category);
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(updatePage);
    console.log(TopTrendingrecipe);
    //ajaxtofillIngredients(TopTrendingrecipe);
  });

  //When earch recipe title is clicked bring the ingredients image and link and nutriotion facts of the recipe
  $(document).on("click", ".recipe-link", function (event) {
    //console.log($(this));

    var recipeID = $(this).attr("value");
    //console.log(recipeID);
    var queryUrlByID = buildQueryURLforID(recipeID);
    //For FB
    recipeIDforFB = recipeID;


    $.ajax({
      url: queryUrlByID,
      method: "GET"
    }).then(function (response) {
      //console.log(response);
      GetRecipeDetails(response);
    });

  });

  //Search bar to get the recipes for the keyword entered
  $("#search-btn").on("click", function (event) {
    event.preventDefault();
    $("#dropdown-display").text("Search Category");
    category = $("#search-form-input").val().trim();

    if (category == "") {
      $("#search-form-input").attr("placeholder", "Type Something!")
      return false
    }

    var queryURL = queryUrlForSearchBar(category);
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(updatePage);

  });

  //To save the recipes to firebase 
  $("#myRecipes").on("click", function (event) {
    event.preventDefault();
    var cookies = document.cookie.split(";");
    var cookievalues = cookies[1].split("=");
    var uid = cookievalues[1];
    
    // Creating array to save to FB
    if (uid) {

      console.log(uid);
      console.log(recipeIDforFB);
      $("#recipeadded-message").text("Added to MyRecipes");
 
      database.ref().once("value", function(childSnapshot) {
        // console.log(childSnapshot.val());
        var users = childSnapshot.val();
 
        var usersList = [];
 
        for (user in users) {
          // console.log(user);
          usersList.push(user);
        }
 
        // console.log(usersList);
 
        var userExistsInDB = usersList.some(function(user) {
          return user === uid;
        })
 
        console.log("user exists in db: ", userExistsInDB);
        if(!userExistsInDB) {
          console.log("we need to add this user, so we will add it now");
 
          // Creating array to save to FB
          var myRecipe = {
 
            recipeName: recipeNameforFB,
            ingredients: ingredientsforFB,
            imageLink: imagelinkforFB,
            recipeLink: recipeLinkforFB,
            recipeID: recipeIDforFB,
            recipeCategory: CategoryforFB
 
          }
 
          database.ref().child(uid).push(myRecipe);
        } else {
          database.ref().on("child_added", function(childSnapshot) {
            // console.log("giving us back something from db");
 
            var user = childSnapshot.key;
 
            var recipes = childSnapshot.val()
            // console.log(user)
 
          if (user === uid) {
            console.log("There is a user match");
 
            console.log("This is the new recipe we are adding: ", recipeIDforFB);
 
              var exists = Object.values(recipes).some(function(recipe) {
              console.log(recipe);
                var recipe_ID = recipe.recipeID;
                // console.log(recipe_ID);
 
                return recipe_ID === recipeIDforFB;
 
              });
 
              console.log("exists: ", exists)
 
              if(exists) {
                console.log("recipe already exists")
              } else {
                console.log("We need to add this recipe, so we will add it now");
                  var myRecipe = {
 
                    recipeName: recipeNameforFB,
                    ingredients: ingredientsforFB,
                    imageLink: imagelinkforFB,
                    recipeLink: recipeLinkforFB,
                    recipeID: recipeIDforFB,
                    recipeCategory: CategoryforFB
 
                  }
 
                  database.ref().child(uid).push(myRecipe);
 
              }
 
          } else {
            console.log("These users do not match");
          }
          });
        }
      })
 
 
    } else {
      return false;
    }

  });

  //Google Signin 
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
      signedIn = true;
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

  //On click sign out clear cookies 
  $("#sign-out").on("click",function(event){
   removeCookie();
   firebase.auth().signOut().then(function(){
    database.ref.off();
    signedIn = false;
   doThiswhenSignedOut();
   });
   location.reload();
  });

  //on page load display the top trending recipes


  //Initializing firebase
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
  $(".regular").slick({
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    useTransform: false,
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 720,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  });
  getLocation();
  TopTrendingRecipesOnPageLoad();
  CheckIfSignedIn();

});