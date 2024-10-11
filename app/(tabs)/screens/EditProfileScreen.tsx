import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIRESTORE_DB } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const EditProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({ phone: '', password: '' });

  useEffect(() => {
    const loadUserData = async () => {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    try {
      const userDocRef = doc(FIRESTORE_DB, 'Login', userData.phone);
      await updateDoc(userDocRef, {
        password: userData.password, // Cập nhật thông tin khác nếu cần
      });
      Alert.alert('Thông báo', 'Cập nhật thành công!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa thông tin</Text>
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={userData.phone}
        onChangeText={(text) => setUserData({ ...userData, phone: text })} // Cho phép chỉnh sửa
        editable={true} // Bỏ khóa chỉnh sửa số điện thoại
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={userData.password}
        onChangeText={(text) => setUserData({ ...userData, password: text })}
        secureTextEntry
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default EditProfileScreen;