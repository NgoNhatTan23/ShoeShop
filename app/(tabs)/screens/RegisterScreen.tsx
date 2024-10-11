import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const RegisterScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (username === '' || phone === '' || password === '') {
      setErrorMessage('Vui lòng nhập tên người dùng, số điện thoại và mật khẩu');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const newUser = {
        username: username,
        phone: phone,
        password: password,
        role: false, // role mặc định là false
      };

      await addDoc(collection(FIRESTORE_DB, 'Login'), newUser);
      setErrorMessage('Đăng ký thành công');

      // Chuyển hướng sang trang đăng nhập sau khi đăng ký thành công
      navigation.replace('Login');
    } catch (error: any) {
      setErrorMessage('Lỗi khi đăng ký: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Ký</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        onChangeText={setPhone}
        value={phone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity 
        style={styles.registerButton} 
        onPress={handleRegister} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.registerText}>Đăng Ký</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  registerButton: {
    backgroundColor: '#F08080',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  registerText: {
    color: 'white',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
  },
  loginText: {
    marginTop: 20,
    color: '#007BFF',
  },
});

export default RegisterScreen;