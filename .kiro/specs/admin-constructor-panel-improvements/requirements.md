# Requirements Document

## Introduction

This document specifies requirements for critical improvements to the RCMS (RoadCare Management System) Admin and Constructor panels. The system manages civic complaints across Gujarat State with 33 districts and 256 wards. The improvements address 7 critical issues affecting usability, notification reliability, SLA management, and image handling across the complaint lifecycle.

## Glossary

- **Admin_Panel**: Web interface used by Ward Administrators to manage complaints, assign tasks, and verify completion
- **Constructor_Panel**: Web interface used by field workers (constructors) to view assigned tasks and submit completion proof
- **Constructor_Directory**: Admin panel page displaying all available constructors with their workload status
- **Notification_Service**: Backend service responsible for creating and delivering in-app notifications
- **Notification_Bell**: UI component displaying notification count and dropdown list
- **SLA_Configuration**: Super Admin-defined time limits for complaint resolution based on priority levels
- **SLA_Countdown**: Visual display showing time remaining until SLA deadline
- **Completion_Photos**: Images uploaded by constructors as proof of completed work
- **Original_Photos**: Images uploaded by citizens when filing complaints
- **Image_Gallery**: UI component displaying multiple images with navigation and lightbox capabilities
- **Photo_Upload_Limit**: Maximum number of images allowed in a single upload operation
- **ComplaintStatusHistory**: Database model storing status changes and associated images
- **Task_Status_Update**: Constructor action changing complaint status (assigned → in_progress → completed)
- **Priority_Level**: Complaint urgency classification (high, medium, low) set by Admin
- **Workload_Indicator**: Visual display showing number of active tasks assigned to a constructor
- **Detail_Page**: Full-screen view showing complete complaint information and images

## Requirements

### Requirement 1: Constructor Directory UI Enhancement

**User Story:** As a Ward Administrator, I want an improved constructor directory interface, so that I can quickly assess worker availability and make informed assignment decisions.

#### Acceptance Criteria

1. THE Constructor_Directory SHALL display constructors in a responsive grid layout with minimum 320px card width
2. WHEN a constructor has zero active tasks, THE Constructor_Directory SHALL display a "low" workload indicator with green styling
3. WHEN a constructor has 1-5 active tasks, THE Constructor_Directory SHALL display a "medium" workload indicator with yellow styling
4. WHEN a constructor has more than 5 active tasks, THE Constructor_Directory SHALL display a "high" workload indicator with red styling
5. THE Constructor_Directory SHALL display constructor name, email, phone, and active task count on each card
6. THE Constructor_Directory SHALL maintain day/night theme consistency with the rest of the Admin_Panel
7. THE Constructor_Directory SHALL sort constructors by active task count in ascending order (least busy first)

### Requirement 2: Photo Upload Limit Enforcement

**User Story:** As a system administrator, I want to enforce a 5-photo maximum limit for constructor completion uploads, so that storage costs remain manageable and upload times are reasonable.

#### Acceptance Criteria

1. WHEN a constructor selects images for completion proof, THE Constructor_Panel SHALL prevent selection of more than 5 images
2. WHEN a constructor attempts to upload more than 5 images, THE Constructor_Panel SHALL display an error message "Maximum 5 photos allowed"
3. THE Constructor_Panel SHALL display a counter showing "X of 5 photos selected" during image selection
4. WHEN exactly 5 images are selected, THE Constructor_Panel SHALL disable further image selection
5. THE Constructor_Panel SHALL validate image count on the backend and reject requests with more than 5 images
6. WHEN backend validation fails, THE Constructor_Panel SHALL display the server error message to the constructor
7. THE Constructor_Panel SHALL require at least 1 image for completion proof submission

### Requirement 3: SLA Configuration System

**User Story:** As a Super Administrator, I want to configure SLA durations for each priority level, so that complaint resolution times align with organizational policies.

#### Acceptance Criteria

1. THE System SHALL store SLA duration configurations for high, medium, and low Priority_Level values
2. THE System SHALL default to 24 hours for high priority, 72 hours for medium priority, and 168 hours for low priority
3. WHEN a Super Admin updates SLA_Configuration, THE System SHALL apply new durations to newly created complaints only
4. THE System SHALL preserve existing SLA deadlines for complaints created before configuration changes
5. WHEN an Admin assigns a Priority_Level to a complaint, THE System SHALL calculate slaDueDate by adding the configured duration to the current timestamp
6. THE System SHALL store slaDueDate as a UTC timestamp in the Complaint model
7. THE System SHALL expose an API endpoint for Super Admins to update SLA_Configuration values

### Requirement 4: SLA Deadline Display

**User Story:** As a user of any panel, I want to see SLA deadlines and countdowns, so that I can prioritize urgent complaints.

#### Acceptance Criteria

1. WHEN a complaint has a slaDueDate, THE System SHALL display an SLA_Countdown showing hours and minutes remaining
2. WHEN slaDueDate is more than 24 hours away, THE System SHALL display the countdown with green styling
3. WHEN slaDueDate is within 24 hours, THE System SHALL display the countdown with yellow styling and a warning icon
4. WHEN slaDueDate has passed, THE System SHALL display "SLA BREACHED" with red styling and an alert icon
5. THE System SHALL display SLA_Countdown on complaint list cards in all panels (Citizen, Admin, Constructor, Super Admin)
6. THE System SHALL display SLA_Countdown on Detail_Page views in all panels
7. THE System SHALL update SLA_Countdown display every 60 seconds without requiring page refresh

### Requirement 5: Notification Creation on Task Status Updates

**User Story:** As an Administrator, I want to receive notifications when constructors update task status, so that I can monitor work progress without manually checking each complaint.

#### Acceptance Criteria

1. WHEN a constructor changes status from "assigned" to "in_progress", THE Notification_Service SHALL create a notification for the assigned Admin
2. WHEN a constructor changes status to "completed", THE Notification_Service SHALL create a notification for the assigned Admin with title "Task Completed"
3. WHEN a constructor changes status to "completed", THE Notification_Service SHALL create a notification for the complaint citizen with title "Work Completed"
4. THE Notification_Service SHALL include the complaint number in all notification messages
5. THE Notification_Service SHALL set notification type to "info" for in_progress updates and "success" for completed updates
6. THE Notification_Service SHALL link notifications to the complaint ID for navigation purposes
7. WHEN notification creation fails, THE System SHALL log the error but continue processing the status update

### Requirement 6: Admin Visibility of Completion Photos

**User Story:** As an Administrator, I want to view constructor completion photos on the complaint detail page, so that I can verify work quality before approving closure.

#### Acceptance Criteria

1. WHEN viewing a complaint Detail_Page, THE Admin_Panel SHALL retrieve all ComplaintStatusHistory records with images
2. THE Admin_Panel SHALL display Completion_Photos separately from Original_Photos with clear section labels
3. WHEN ComplaintStatusHistory contains images for "completed" status, THE Admin_Panel SHALL display those images in the completion section
4. THE Admin_Panel SHALL display the constructor name and timestamp alongside Completion_Photos
5. THE Admin_Panel SHALL display constructor comments from ComplaintStatusHistory alongside Completion_Photos
6. WHEN no Completion_Photos exist, THE Admin_Panel SHALL display "No completion photos uploaded yet"
7. THE Admin_Panel SHALL maintain day/night theme consistency for the completion photos section

### Requirement 7: Image Gallery with Navigation

**User Story:** As a user viewing complaint details, I want to navigate through all images with a gallery interface, so that I can examine all visual evidence without leaving the page.

#### Acceptance Criteria

1. WHEN a Detail_Page contains multiple images, THE System SHALL display an Image_Gallery with thumbnail navigation
2. THE Image_Gallery SHALL display the first image by default with thumbnails below showing all available images
3. WHEN a user clicks a thumbnail, THE Image_Gallery SHALL display the selected image as the main view
4. WHEN a user clicks the main image, THE Image_Gallery SHALL open a lightbox showing the full-size image
5. THE Image_Gallery SHALL provide previous/next navigation arrows when in lightbox mode
6. WHEN the user presses the Escape key, THE Image_Gallery SHALL close the lightbox and return to the Detail_Page
7. THE Image_Gallery SHALL display both Original_Photos and Completion_Photos in separate gallery sections
8. THE Image_Gallery SHALL indicate the current image position (e.g., "3 of 7")
9. THE Image_Gallery SHALL support touch gestures for swipe navigation on mobile devices
10. THE Image_Gallery SHALL maintain day/night theme styling in both gallery and lightbox modes

### Requirement 8: Notification Bell Reliability

**User Story:** As a user of any panel, I want reliable notification delivery, so that I never miss important updates about complaints.

#### Acceptance Criteria

1. WHEN the Notification_Bell component mounts, THE System SHALL fetch all notifications for the current user
2. THE Notification_Bell SHALL poll for new notifications every 60 seconds
3. WHEN new unread notifications exist, THE Notification_Bell SHALL display a red dot indicator
4. WHEN the user clicks the Notification_Bell, THE System SHALL display a dropdown showing the 20 most recent notifications
5. THE Notification_Bell SHALL display unread notifications with bold text and highlighted background
6. WHEN the user clicks an unread notification, THE System SHALL mark it as read and remove the bold styling
7. THE Notification_Bell SHALL display notification type icons (info, success, warning, error) with appropriate colors
8. THE Notification_Bell SHALL display a "Mark all read" button when unread notifications exist
9. WHEN the user clicks "Mark all read", THE System SHALL mark all notifications as read and update the display
10. THE Notification_Bell SHALL maintain consistent styling across day/night themes

### Requirement 9: Backend Notification Validation

**User Story:** As a system maintainer, I want comprehensive notification creation across all complaint lifecycle events, so that users stay informed without manual checking.

#### Acceptance Criteria

1. WHEN a complaint is created, THE Notification_Service SHALL create a notification for the citizen
2. WHEN an Admin assigns a complaint, THE Notification_Service SHALL create a notification for the assigned constructor
3. WHEN a constructor starts work, THE Notification_Service SHALL create a notification for the citizen
4. WHEN a constructor completes work, THE Notification_Service SHALL create notifications for both the Admin and the citizen
5. WHEN an Admin approves completion, THE Notification_Service SHALL create a notification for the citizen
6. WHEN an Admin escalates a complaint, THE Notification_Service SHALL create a notification for the Super Admin
7. WHEN a citizen reopens a complaint, THE Notification_Service SHALL create a notification for the previously assigned Admin
8. THE Notification_Service SHALL include the complaint number in all notification messages
9. THE Notification_Service SHALL set appropriate notification types (info, success, warning, error) based on the event
10. WHEN notification creation fails, THE System SHALL log the error with user ID, complaint ID, and error message

### Requirement 10: Photo Upload Limit Backend Validation

**User Story:** As a security engineer, I want server-side validation of photo upload limits, so that malicious clients cannot bypass frontend restrictions.

#### Acceptance Criteria

1. WHEN the backend receives a completion proof upload, THE System SHALL count the number of images in the request
2. WHEN the image count exceeds 5, THE System SHALL reject the request with HTTP 400 status
3. WHEN the image count exceeds 5, THE System SHALL return error message "Maximum 5 photos allowed for completion proof"
4. THE System SHALL validate image count before processing any file uploads to prevent wasted storage operations
5. THE System SHALL log photo upload limit violations with constructor ID and complaint ID
6. WHEN the image count is 0 for a completion status update, THE System SHALL reject the request with error "At least 1 photo required"
7. THE System SHALL validate that uploaded files are valid image formats (JPEG, PNG, WebP)

### Requirement 11: SLA Configuration API

**User Story:** As a Super Administrator, I want a dedicated API endpoint to manage SLA configurations, so that I can adjust resolution timeframes without code changes.

#### Acceptance Criteria

1. THE System SHALL provide a GET endpoint at /api/superadmin/sla-config returning current SLA_Configuration values
2. THE System SHALL provide a PUT endpoint at /api/superadmin/sla-config accepting high, medium, and low duration values in hours
3. WHEN a Super Admin updates SLA_Configuration, THE System SHALL validate that all duration values are positive integers
4. WHEN a Super Admin updates SLA_Configuration, THE System SHALL validate that high priority duration is less than medium priority duration
5. WHEN a Super Admin updates SLA_Configuration, THE System SHALL validate that medium priority duration is less than low priority duration
6. WHEN validation fails, THE System SHALL return HTTP 400 with a descriptive error message
7. WHEN SLA_Configuration is updated successfully, THE System SHALL return the new configuration values
8. THE System SHALL restrict SLA_Configuration endpoints to users with role "super_admin"
9. THE System SHALL log all SLA_Configuration changes with Super Admin ID and timestamp

### Requirement 12: Image Gallery Component Reusability

**User Story:** As a frontend developer, I want a reusable Image_Gallery component, so that I can maintain consistent image viewing across all detail pages.

#### Acceptance Criteria

1. THE Image_Gallery SHALL accept an array of image URLs as a prop
2. THE Image_Gallery SHALL accept an optional title prop for the gallery section
3. THE Image_Gallery SHALL accept an optional theme prop (light/dark) defaulting to the current theme context
4. THE Image_Gallery SHALL render nothing when the images array is empty
5. THE Image_Gallery SHALL handle both absolute URLs (Cloudinary) and relative URLs (local storage)
6. THE Image_Gallery SHALL display a loading spinner while images are loading
7. THE Image_Gallery SHALL display an error placeholder when an image fails to load
8. THE Image_Gallery SHALL be used in CitizenIssueDetail, AdminIssueDetail, ConstructorTaskDetail, and SuperAdminIssueDetail pages
9. THE Image_Gallery SHALL maintain aspect ratio for all images without distortion
10. THE Image_Gallery SHALL optimize performance by lazy-loading images outside the viewport

### Requirement 13: Constructor Directory Search and Filter

**User Story:** As a Ward Administrator with many constructors, I want to search and filter the constructor directory, so that I can quickly find available workers.

#### Acceptance Criteria

1. THE Constructor_Directory SHALL provide a search input field filtering by constructor name, email, or phone
2. WHEN a user types in the search field, THE Constructor_Directory SHALL filter results in real-time with 300ms debounce
3. THE Constructor_Directory SHALL provide a filter dropdown for workload level (all, low, medium, high)
4. WHEN a workload filter is selected, THE Constructor_Directory SHALL display only constructors matching that workload level
5. THE Constructor_Directory SHALL display "No constructors found" when search/filter results are empty
6. THE Constructor_Directory SHALL display the total count of visible constructors after filtering
7. THE Constructor_Directory SHALL preserve search and filter state when navigating away and returning to the page

### Requirement 14: SLA Breach Notification

**User Story:** As an Administrator, I want automatic notifications when SLA deadlines are breached, so that I can take corrective action immediately.

#### Acceptance Criteria

1. THE System SHALL run an SLA monitoring cron job every 15 minutes
2. WHEN the cron job detects a complaint with slaDueDate in the past and isSlaBreached=false, THE System SHALL set isSlaBreached=true
3. WHEN isSlaBreached is set to true, THE Notification_Service SHALL create a notification for the assigned Admin with type "error"
4. WHEN isSlaBreached is set to true for an escalated complaint, THE Notification_Service SHALL create a notification for the Super Admin
5. THE System SHALL include complaint number, priority, and hours overdue in the breach notification message
6. THE System SHALL create only one breach notification per complaint (idempotent)
7. THE System SHALL log all SLA breach detections with complaint ID and breach duration

### Requirement 15: Completion Photo Timestamp Display

**User Story:** As an Administrator reviewing completion proof, I want to see when photos were uploaded, so that I can verify work was completed within the expected timeframe.

#### Acceptance Criteria

1. WHEN displaying Completion_Photos, THE Admin_Panel SHALL show the upload timestamp from ComplaintStatusHistory
2. THE Admin_Panel SHALL format timestamps as "DD MMM YYYY, HH:MM AM/PM" in Indian Standard Time
3. THE Admin_Panel SHALL display the time elapsed since upload (e.g., "2 hours ago") alongside the absolute timestamp
4. WHEN Completion_Photos were uploaded more than 24 hours after task assignment, THE Admin_Panel SHALL display a warning indicator
5. THE Admin_Panel SHALL display the constructor name who uploaded the photos
6. THE Admin_Panel SHALL display constructor comments from the same ComplaintStatusHistory record
7. THE Admin_Panel SHALL group all information (photos, timestamp, constructor, comments) in a visually distinct completion section
