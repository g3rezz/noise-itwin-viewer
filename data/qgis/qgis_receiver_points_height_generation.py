'''
Adds height_m attribute to the receiver points and duplicates the points according to the height of the building.
'''

# Change the layer names if needed
receiver_layer = QgsProject.instance().mapLayersByName('Receivers_3857')[0]
building_layer = QgsProject.instance().mapLayersByName('Buildings_3857')[0]

# Check if 'height_m' field already exists
if receiver_layer.fields().indexFromName('height_m') == -1:
    # Add the 'height_m' field as an integer
    field = QgsField('height_m', QVariant.Int)
    receiver_layer.startEditing()
    receiver_layer.addAttribute(field)
    receiver_layer.updateFields()

    # Set all 'height_m' values to 0
    height_m_idx = receiver_layer.fields().indexFromName('height_m')
    features = receiver_layer.getFeatures()
    for feature in features:
        receiver_layer.changeAttributeValue(feature.id(), height_m_idx, 0)

    # Save changes and stop editing
    receiver_layer.commitChanges()

print("height_m attribute added successfully to layer Receivers_3857.")

# Get the last 'id_pt' value in the receiver layer
last_id_pt = max([feature['id_pt'] for feature in receiver_layer.getFeatures()])

# Iterate through the features in the building layer
for building_feature in building_layer.getFeatures():
    facade_height = building_feature['height_m']
    # print(f"facade_height: {facade_height}")
    
    # Get the building ID
    building_id = building_feature['id']
    # print(f"building_id: {building_id}")

    # Variable to keep track if a match is found for the current building
    match_found = False

    # Iterate through the existing points in the receiver points layer
    for point_feature in receiver_layer.getFeatures():
        # Check if the building IDs match
        if point_feature['id_bui'] == building_id:
            match_found = True
            # print(f"Match! id_bui: {building_id}; point_feature_id_bui: {point_feature['id_bui']}")

            # Calculate height levels based on facade height
            height = facade_height

            new_feature = QgsFeature(receiver_layer.fields())
                
            # Set the geometry to the geometry of an existing point in receiver points layer
            point_geometry = point_feature.geometry()
            new_feature.setGeometry(point_geometry)
            
            # Increment the 'id_pt' by 1 according to the last 'id_pt' value
            new_feature.setAttribute('id_pt', last_id_pt + 1)
            
            # Assign other attributes
            new_feature.setAttribute('id_bui', building_id)
            new_feature.setAttribute('facadeP', point_feature['facadeP'])
            new_feature.setAttribute('height_m', height)
            
            # Add the new feature to the receiver points layer
            receiver_layer.dataProvider().addFeatures([new_feature])

            last_id_pt += 1
            print(f"Created Point: id_pt={last_id_pt}, id_bui={building_id}, facadeP={point_feature['facadeP']}, height_m={height}")

receiver_layer.updateExtents()

iface.mapCanvas().refreshAllLayers()

print("Script executed successfully.")