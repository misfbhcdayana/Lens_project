// @input Asset.ObjectPrefab[] veggiePrefabs
// @input Asset.ObjectPrefab[] fastFoodPrefabs
// @input float spawnInterval = 1.5
// @input float fallSpeed = 10.0
// @input SceneObject headBinding //Head Binding here
// @input Component.FaceStretchVisual faceStretch // Face Stretch here
// @input float eatDistance = 7.0 // Distance threshold for eating
// @input Asset.ObjectPrefab particlePrefab
// @input Component.AudioComponent audio

var timer = 0;
var isMouthOpen = false;

//detect mouth state from the Face Mesh/Tracking
script.createEvent("MouthOpenedEvent").bind(function() { isMouthOpen = true; });
script.createEvent("MouthClosedEvent").bind(function() { isMouthOpen = false; });

function spawnFood() {
    // 1. Randomly decide: Veggie (0) or Fast Food (1)?
    var isVeggie = Math.random() > 0.5;
    var selectedArray = isVeggie ? script.veggiePrefabs : script.fastFoodPrefabs;
    
    // 2. Pick a random prefab from that array
    var randomIndex = Math.floor(Math.random() * selectedArray.length);
    var foodPrefab = selectedArray[randomIndex];
    
    if (!foodPrefab) return;

    // 3. Instantiate the food
    var newFood = foodPrefab.instantiate(script.getSceneObject());
    
    // 4. Set random starting position at the top
    var screenWidth = 20;
    var randomX = (Math.random() * screenWidth) - (screenWidth / 2);
    newFood.getTransform().setLocalPosition(new vec3(randomX, 30, 0));

    // 5. Add a "Type" property so we know what it is when we eat it
    newFood.isHealthy = isVeggie;
}

script.createEvent("UpdateEvent").bind(function() {
    timer += getDeltaTime();
    if (timer >= script.spawnInterval) 
    { 
        spawnFood(); 
        timer = 0; 
    }

    var childrenCount = script.getSceneObject().getChildrenCount();
    var headPos = script.headBinding.getTransform().getWorldPosition();

    for (var i = childrenCount - 1; i >= 0; i--) {
        var child = script.getSceneObject().getChild(i);
        var childTrans = child.getTransform();
        var pos = childTrans.getLocalPosition();

        // 1. Move Food Down
        pos.y -= script.fallSpeed * getDeltaTime();
        childTrans.setLocalPosition(pos);

        // 2. Check "Eating" Condition
        var dist = childTrans.getWorldPosition().distance(headPos);
        
        if (dist < script.eatDistance && isMouthOpen) {
            handleEat(child.isHealthy);
            child.destroy();
            script.audio.play(1);
            continue; 
        }

        // 3. Cleanup
        if (pos.y < -50) { child.destroy(); }
    }
});
function handleEat(healthy) {
    if (!script.faceStretch) return;

    // We pass the string name "Feature 0" instead of the number 0
    var featureName = "Feature 0"; 
    
    var currentWeight = script.faceStretch.getFeatureWeight(featureName);

    // Safety check in case the name is slightly different
    if (currentWeight == null || isNaN(currentWeight)) {
        print("ERROR: Could not find feature named '" + featureName + "'. Check your Face Stretch Inspector!");
        currentWeight = 0;
    }

    var changeAmount = 0.2;
    var newWeight;

    if (healthy === true) {
        newWeight = Math.max(0, currentWeight - changeAmount);
        print("Healthy! New Weight: " + newWeight.toFixed(2));
    } else {
        newWeight = Math.min(1, currentWeight + changeAmount);
        print("Junk! New Weight: " + newWeight.toFixed(2));
    }

    // Apply using the string name
    script.faceStretch.setFeatureWeight(featureName, newWeight);

    // Particles
    if (script.particlePrefab) {
        var splash = script.particlePrefab.instantiate(script.getSceneObject());
        splash.getTransform().setWorldPosition(script.headBinding.getTransform().getWorldPosition());
    }
}