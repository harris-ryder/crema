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
import HeartIcon from "@/src/ui/icons/heart-icon";

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
  const [selectedDate, setSelectedDate] = useState(
    date ? new Date(date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // For multiple images, track each image's date
  const [imageDates, setImageDates] = useState<{ [key: number]: string }>(
    parsedImages
      ? parsedImages.reduce((acc: any, img: any, index: number) => {
          acc[index] = img.date;
          return acc;
        }, {})
      : {}
  );
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [showMultiDatePicker, setShowMultiDatePicker] = useState(false);

  // Track upload status for each image
  const [imageUploadStatus, setImageUploadStatus] = useState<{ 
    [key: number]: 'pending' | 'uploading' | 'success' | 'failed' 
  }>({});

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
        failed: 0,
      });

      let successCount = 0;
      let failCount = 0;
      const failedImages: string[] = [];

      for (let i = 0; i < parsedImages.length; i++) {
        const image = parsedImages[i];
        setUploadProgress((prev) => ({ ...prev, current: i + 1 }));
        
        // Mark image as uploading
        setImageUploadStatus(prev => ({ ...prev, [i]: 'uploading' }));

        try {
          const formData = new FormData();
          formData.append("file", {
            uri: image.uri,
            type: "image/jpeg",
            name: `post_${i}.jpg`,
          } as any);
          // Use the updated date from imageDates state
          formData.append("postDate", imageDates[i] || image.date);

          const response = await fetch(`${config.urls.backend}/posts`, {
            method: "POST",
            headers: header,
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload image ${i + 1}`);
          }

          successCount++;
          setUploadProgress((prev) => ({
            ...prev,
            successful: successCount,
          }));
          
          // Mark image as successfully uploaded
          setImageUploadStatus(prev => ({ ...prev, [i]: 'success' }));
        } catch (error) {
          console.error(`Error uploading image ${i + 1}:`, error);
          failCount++;
          failedImages.push(image.date);
          setUploadProgress((prev) => ({
            ...prev,
            failed: failCount,
          }));
          
          // Mark image as failed
          setImageUploadStatus(prev => ({ ...prev, [i]: 'failed' }));
        }
      }

      // Show summary and navigate back
      if (failCount > 0) {
        Alert.alert(
          "Upload Complete",
          `Successfully uploaded ${successCount} of ${totalImages} images.${
            failCount > 0 ? ` ${failCount} failed.` : ""
          }`,
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
        {/* Show multiple images preview - always visible */}
        {isMultiple && parsedImages ? (
          <>
            {/* Show upload progress text when uploading */}
            {isLoading && (
              <View style={styles.uploadProgressHeader}>
                <Text style={styles.uploadProgressText}>
                  Uploading: {uploadProgress.successful} / {uploadProgress.total}
                </Text>
              </View>
            )}
            
            {/* Images scroll view */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesPreviewScroll}
              >
                <View style={styles.imagesPreviewContainer}>
                  {parsedImages.map((img: any, index: number) => (
                    <View key={index} style={styles.imagePreviewWrapper}>
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: img.uri }}
                          style={styles.previewImage}
                        />
                        
                        {/* Show overlay when uploading or uploaded */}
                        {imageUploadStatus[index] && (
                          <View style={[
                            styles.imageOverlay,
                            imageUploadStatus[index] === 'success' && styles.successOverlay,
                            imageUploadStatus[index] === 'uploading' && styles.uploadingOverlay,
                            imageUploadStatus[index] === 'failed' && styles.failedOverlay,
                          ]}>
                            {imageUploadStatus[index] === 'success' && (
                              <HeartIcon width={50} height={50} fill={theme.colors.brand.red} />
                            )}
                            {imageUploadStatus[index] === 'uploading' && (
                              <ActivityIndicator size="large" color={theme.colors.content.inverse} />
                            )}
                            {imageUploadStatus[index] === 'failed' && (
                              <MaterialIcons name="error" size={40} color={theme.colors.content.inverse} />
                            )}
                          </View>
                        )}
                      </View>
                      
                      <TouchableOpacity
                        style={[
                          styles.dateButton,
                          imageUploadStatus[index] === 'success' && styles.disabledDateButton
                        ]}
                        onPress={() => {
                          // Disable date change if already uploaded
                          if (imageUploadStatus[index] === 'success') return;
                          setActiveImageIndex(index);
                          setShowMultiDatePicker(true);
                        }}
                        disabled={imageUploadStatus[index] === 'success'}
                      >
                        <MaterialIcons
                          name="calendar-month"
                          size={16}
                          color={theme.colors.content.primary}
                        />
                        <Text style={styles.imageDateLabel}>
                          {imageDates[index] || img.date}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
          </>
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
              <Text style={styles.dateText}>
                {formatDate(selectedDate)}
              </Text>
            </TouchableOpacity>

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.selectedImage}
              />
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

        {/* Date picker for multiple images */}
        {isMultiple && activeImageIndex !== null && (
          <DatePicker
            modal
            open={showMultiDatePicker}
            date={
              imageDates[activeImageIndex]
                ? new Date(imageDates[activeImageIndex])
                : new Date()
            }
            mode="date"
            onConfirm={(date) => {
              if (activeImageIndex !== null) {
                setImageDates((prev) => ({
                  ...prev,
                  [activeImageIndex]: formatDateForAPI(date),
                }));
              }
              setShowMultiDatePicker(false);
              setActiveImageIndex(null);
            }}
            onCancel={() => {
              setShowMultiDatePicker(false);
              setActiveImageIndex(null);
            }}
            maximumDate={new Date()}
            minimumDate={new Date(2020, 0, 1)}
          />
        )}

        {/* Only show input for single image mode */}
        {!isMultiple && (
          <>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.brand.red}
                />
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
            ? isMultiple
              ? "Uploading..."
              : "Posting"
            : isMultiple
            ? `Upload ${parsedImages?.length || 0} Images`
            : "Share"
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
      color: theme.colors.content.primary,
      fontSize: 12,
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface.secondary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginTop: 8,
      gap: 4,
    },
    disabledDateButton: {
      opacity: 0.5,
    },
    imageContainer: {
      position: "relative",
    },
    imageOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
    },
    successOverlay: {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    uploadingOverlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    failedOverlay: {
      backgroundColor: "rgba(255, 0, 0, 0.3)",
    },
    uploadProgressHeader: {
      paddingVertical: 10,
      alignItems: "center",
    },
    uploadProgressText: {
      ...type.title,
      color: theme.colors.content.primary,
    },
  });
