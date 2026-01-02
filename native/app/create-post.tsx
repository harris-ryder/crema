import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import DatePicker from "react-native-date-picker";
import config from "@/config";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/Button";
import { Theme, useTheme, type } from "@/src/design";

export default function CreatePost() {
  const { header } = useAuth();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { imageUri, date, images, multipleMode } = useLocalSearchParams<{
    imageUri: string;
    date: string;
    images: string;
    multipleMode: string;
  }>();
  
  // Parse multiple images if in multiple mode
  const isMultiple = multipleMode === "true";
  const parsedImages = isMultiple && images ? JSON.parse(images) : null;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(date ? new Date(date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // For batch upload progress tracking
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    successful: number;
    failed: number;
  }>({ current: 0, total: 0, successful: 0, failed: 0 });


  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleCreatePost = async () => {
    // Handle multiple images mode
    if (isMultiple && parsedImages) {
      setIsLoading(true);
      setError("");
      
      const totalImages = parsedImages.length;
      setUploadProgress({ 
        current: 0, 
        total: totalImages, 
        successful: 0, 
        failed: 0 
      });
      
      let successCount = 0;
      let failCount = 0;
      const failedImages: string[] = [];
      
      for (let i = 0; i < parsedImages.length; i++) {
        const image = parsedImages[i];
        setUploadProgress(prev => ({ ...prev, current: i + 1 }));
        
        try {
          const formData = new FormData();
          formData.append("file", {
            uri: image.uri,
            type: "image/jpeg",
            name: `post_${i}.jpg`,
          } as any);
          formData.append("postDate", image.date);

          const response = await fetch(`${config.urls.backend}/posts`, {
            method: "POST",
            headers: header,
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload image ${i + 1}`);
          }
          
          successCount++;
          setUploadProgress(prev => ({ 
            ...prev, 
            successful: successCount 
          }));
        } catch (error) {
          console.error(`Error uploading image ${i + 1}:`, error);
          failCount++;
          failedImages.push(image.date);
          setUploadProgress(prev => ({ 
            ...prev, 
            failed: failCount 
          }));
        }
      }
      
      // Show summary and navigate back
      if (failCount > 0) {
        Alert.alert(
          "Upload Complete",
          `Successfully uploaded ${successCount} of ${totalImages} images.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        // All successful, just go back
        router.back();
      }
      
      setIsLoading(false);
      return;
    }
    
    // Original single image upload logic
    if (!imageUri) {
      setError("No image selected");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "post.jpg",
      } as any);
      formData.append("postDate", formatDateForAPI(selectedDate));

      const response = await fetch(`${config.urls.backend}/posts`, {
        method: "POST",
        headers: header,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      router.back();
    } catch (error) {
      console.error("Post creation error:", error);
      setError("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="close"
            size={30}
            color={theme.colors.content.primary}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Show batch upload progress for multiple images */}
          {isMultiple && parsedImages && isLoading ? (
            <View style={styles.batchUploadContainer}>
              <Text style={styles.uploadTitle}>
                Uploading {parsedImages.length} images...
              </Text>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  Progress: {uploadProgress.current} / {uploadProgress.total}
                </Text>
                {uploadProgress.successful > 0 && (
                  <Text style={[styles.progressText, { color: theme.colors.brand.green }]}>
                    Successful: {uploadProgress.successful}
                  </Text>
                )}
                {uploadProgress.failed > 0 && (
                  <Text style={[styles.progressText, { color: theme.colors.brand.red }]}>
                    Failed: {uploadProgress.failed}
                  </Text>
                )}
              </View>
              <ActivityIndicator size="large" color={theme.colors.brand.red} />
            </View>
          ) : (
            <>
              {/* Show multiple images preview */}
              {isMultiple && parsedImages ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.imagesPreviewScroll}
                >
                  <View style={styles.imagesPreviewContainer}>
                    {parsedImages.map((img: any, index: number) => (
                      <View key={index} style={styles.imagePreviewWrapper}>
                        <Image
                          source={{ uri: img.uri }}
                          style={styles.previewImage}
                        />
                        <Text style={styles.imageDateLabel}>{img.date}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <>
                  {/* Original single image UI */}
                  <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <MaterialIcons
                      name="calendar-month"
                      size={20}
                      color={theme.colors.content.primary}
                    />
                    <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                  </TouchableOpacity>

                  {imageUri && (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.selectedImage}
                    />
                  )}
                </>
              )}
            </>
          )}

          <DatePicker
            modal
            open={showDatePicker}
            date={selectedDate}
            mode="date"
            onConfirm={(date) => {
              setShowDatePicker(false);
              setSelectedDate(date);
            }}
            onCancel={() => {
              setShowDatePicker(false);
            }}
            maximumDate={new Date()}
            minimumDate={new Date(2020, 0, 1)}
          />

          {/* Only show input for single image mode */}
          {!isMultiple && (
            <>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.brand.red} />
                </View>
              )}
            </>
          )}
        </View>
        <Button
          variant="primary"
          size="lg"
          label={
            isLoading 
              ? (isMultiple ? "Uploading..." : "Posting")
              : (isMultiple ? `Upload ${parsedImages?.length || 0} Images` : "Share")
          }
          onPress={handleCreatePost}
          style={{ position: "absolute", right: 32, bottom: 60 }}
          disabled={isLoading}
        />
      </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface.primary,
    },
    closeButton: {
      position: "absolute",
      top: 50,
      right: 20,
      zIndex: 1,
      padding: 10,
    },
    content: {
      flex: 1,
      paddingHorizontal: 36,
      justifyContent: "center",
      gap: 18,
      alignItems: "center",
      position: "relative",
    },
    imageContainer: {
      alignItems: "center",
      marginBottom: 30,
    },
    selectedImage: {
      width: 256,
      height: 256,
      borderRadius: 32,
    },
    error: {
      ...type.body,
      color: theme.colors.brand.red,
      marginTop: 5,
    },
    buttonContainer: {
      alignItems: "flex-end",
    },
    loadingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    dateSelector: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface.secondary,
      paddingHorizontal: 24,
      paddingVertical: 18,
      borderRadius: 32,
      minHeight: 60,
      width: 256,
      gap: 12,
    },
    dateText: {
      ...type.body,
      color: theme.colors.content.primary,
    },
    batchUploadContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 24,
    },
    uploadTitle: {
      ...type.heading1,
      color: theme.colors.content.primary,
      textAlign: "center",
      fontSize: 24,
    },
    progressInfo: {
      alignItems: "center",
      gap: 8,
    },
    progressText: {
      ...type.body,
      color: theme.colors.content.tertiary,
    },
    imagesPreviewScroll: {
      maxHeight: 300,
    },
    imagesPreviewContainer: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 20,
    },
    imagePreviewWrapper: {
      alignItems: "center",
      gap: 8,
    },
    previewImage: {
      width: 150,
      height: 150,
      borderRadius: 16,
    },
    imageDateLabel: {
      ...type.weak,
      color: theme.colors.content.tertiary,
      fontSize: 11,
    },
  });
