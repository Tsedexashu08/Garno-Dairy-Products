import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../services/Database'; // Adjust import path as needed

const AddProduct = ({ onProductAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    measurement: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const inset=useSafeAreaInsets();
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadingImage(true);
        // For now, we'll use the URI directly
        // In production, you'd want to upload this to Supabase Storage
        handleInputChange('image', result.assets[0].uri);
        setUploadingImage(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
      setUploadingImage(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadingImage(true);
        handleInputChange('image', result.assets[0].uri);
        setUploadingImage(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      setUploadingImage(false);
    }
  };

  const uploadImageToSupabase = async (imageUri) => {
    // This is a simplified version - you'll need to implement proper Supabase Storage upload
    // For now, we'll use the URI directly or you can implement proper file upload
    return imageUri;
    
    // Example of proper Supabase Storage upload (uncomment and implement):
    /*
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const fileName = `product_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, blob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
    */
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter product name');
      return false;
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return false;
    }

    if (!formData.measurement.trim()) {
      Alert.alert('Validation Error', 'Please enter product measurement');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      let imageUrl = formData.image;

      // Upload image if one was selected
      if (formData.image) {
        imageUrl = await uploadImageToSupabase(formData.image);
      }

      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        measurement: formData.measurement.trim(),
        image: imageUrl,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('Products')
        .insert([productData])
        .select();

      if (error) throw error;

      Alert.alert(
        'Success!',
        'Product added successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                name: '',
                price: '',
                measurement: '',
                image: ''
              });
              onProductAdded && onProductAdded(data[0]);
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', `Failed to add product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const measurementSuggestions = ['በሊትር', 'ሲኒ', 'በፍሬ', 'ኪሎ', 'ግራም'];

  return (
      <View style={{ flex: 1, paddingTop: inset.top,paddingBottom: inset.bottom, backgroundColor: '#F8F9FA' }}>
        <ImageBackground
                           source={require('../assets/images/Bg.jpg')}
                           style={styles.background}
                           resizeMode="cover"
                       >
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>አዲስ ምርት ይችምሩ</Text>
        <Text style={styles.headerSubtitle}>ወደ ሱቅ የገባ አዲስ ምርት ያስመዝግቡ</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Product Image */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionLabel}>የምርቱ ፎቶ</Text>
            <View style={styles.imageContainer}>
              {formData.image ? (
                <Image source={{ uri: formData.image }} style={styles.productImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>ፎቶ የለም</Text>
                </View>
              )}
            </View>
            
            <View style={styles.imageButtons}>
              <TouchableOpacity
                style={[styles.imageButton, styles.galleryButton]}
                onPress={pickImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.imageButtonText}>ከሲልኮት ይምረጡ</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.imageButton, styles.cameraButton]}
                onPress={takePhoto}
                disabled={uploadingImage}
              >
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>የምርቱ ስም *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="የምርቱን ስም ያስገቡ"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ዋጋ *</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.textInput, styles.priceInput]}
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Measurement */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ልኬት *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.measurement}
              onChangeText={(value) => handleInputChange('measurement', value)}
              placeholder="በኪሎ ፤ በሊትር ወይም ብፍሬ ያስገቡ"
              placeholderTextColor="#9CA3AF"
            />
            
            {/* Measurement Suggestions */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsContainer}
            >
              {measurementSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleInputChange('measurement', suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>ሰርዝ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (!formData.name || !formData.price || !formData.measurement) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading || !formData.name || !formData.price || !formData.measurement}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>ምርቱን ጭምር</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
    </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
      background: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
   borderRadius: 20,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderColor: '#ffff',
    borderWidth: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0F7FA',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  form: {
    padding: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#718096',
    fontSize: 14,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  galleryButton: {
    backgroundColor: '#4ECDC4',
  },
  cameraButton: {
    backgroundColor: '#667EEA',
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#2D3748',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginRight: 12,
    paddingLeft: 16,
  },
  priceInput: {
    flex: 1,
    marginLeft: -8,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionChip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  suggestionText: {
    color: '#4A5568',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#718096',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
  },
  submitButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddProduct;