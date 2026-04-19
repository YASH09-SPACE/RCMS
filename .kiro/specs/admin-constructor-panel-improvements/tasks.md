# Implementation Plan: Admin & Constructor Panel Improvements

## Overview

This implementation plan breaks down the 7 critical improvements to the RCMS Admin and Constructor panels into discrete, sequential coding tasks. The plan covers SLA configuration, photo upload validation, UI enhancements, notification reliability, and image gallery components.

## Tasks

- [x] 1. Create SLAConfiguration model and API endpoints
  - [x] 1.1 Create SLAConfiguration Mongoose model with validation
    - Define schema with high, medium, low duration fields (hours)
    - Add pre-save validation hook to enforce high < medium < low hierarchy
    - Implement singleton pattern (only one config document)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 11.3, 11.4, 11.5_
  
  - [x] 1.2 Implement SLA configuration controller methods
    - Create getSLAConfig method (GET /api/superadmin/sla-config)
    - Create updateSLAConfig method (PUT /api/superadmin/sla-config)
    - Add input validation for positive integers and hierarchy rules
    - Add logging for configuration changes
    - _Requirements: 11.1, 11.2, 11.6, 11.7, 11.9_
  
  - [x] 1.3 Add SLA configuration routes with authorization
    - Create routes in backend/routes (superadmin routes file)
    - Apply authMiddleware and roleMiddleware(['super_admin'])
    - Wire up controller methods
    - _Requirements: 11.8_
  
  - [x] 1.4 Write unit tests for SLA configuration
    - Test valid configuration updates
    - Test invalid hierarchy validation
    - Test missing fields and non-positive values
    - Test unauthorized access attempts

- [x] 2. Enhance complaint assignment with SLA calculation
  - [x] 2.1 Update Admin controller assignComplaint method
    - Fetch SLAConfiguration on complaint assignment
    - Calculate slaDueDate based on priority and config
    - Store slaDueDate in complaint document
    - Update ComplaintStatusHistory with SLA information
    - _Requirements: 3.5, 3.6_
  
  - [x] 2.2 Add notification for constructor on assignment
    - Call notificationService.createNotification for constructor
    - Include complaint number and priority in message
    - Set notification type to 'info'
    - _Requirements: 9.2_
  
  - [x] 2.3 Write unit tests for SLA calculation
    - Test high priority → 24h deadline
    - Test medium priority → 72h deadline
    - Test low priority → 168h deadline
    - Test with custom SLA configuration

- [-] 3. Implement photo upload validation
  - [x] 3.1 Add frontend photo count validation in ConstructorTaskDetail
    - Add MAX_PHOTOS constant (5)
    - Add photoCount state variable
    - Implement handleImageChange with count validation
    - Display "X of 5 photos selected" counter
    - Show error toast if more than 5 photos selected
    - Disable file input when 5 photos selected
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 3.2 Add backend photo count validation in Constructor controller
    - Validate req.files.length <= 5 before processing uploads
    - Return 400 error with message "Maximum 5 photos allowed"
    - Validate at least 1 photo required for completion status
    - Add logging for photo upload violations
    - _Requirements: 2.5, 2.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [x] 3.3 Write integration tests for photo upload validation
    - Test upload with exactly 5 photos (should succeed)
    - Test upload with 6 photos (should fail)
    - Test completion with 0 photos (should fail)
    - Test completion with 1 photo (should succeed)

- [x] 4. Create SLACountdown React component
  - [x] 4.1 Implement SLACountdown component with time calculation
    - Create component in client/src/components/common/SLACountdown.jsx
    - Calculate time remaining from slaDueDate
    - Update countdown every 60 seconds using useEffect
    - Determine status (safe, warning, breached) based on time remaining
    - _Requirements: 4.1, 4.7_
  
  - [x] 4.2 Add color-coded styling for SLA status
    - Green styling for >24h remaining (safe)
    - Yellow styling with warning icon for <24h remaining
    - Red styling with alert icon for breached SLA
    - Support size prop (small, medium)
    - Ensure day/night theme compatibility
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [x] 4.3 Write unit tests for SLACountdown component
    - Test safe status rendering (>24h)
    - Test warning status rendering (<24h)
    - Test breached status rendering
    - Test null slaDueDate (component doesn't render)

- [x] 5. Create ImageGallery React component
  - [x] 5.1 Implement ImageGallery component with thumbnail navigation
    - Create component in client/src/components/common/ImageGallery.jsx
    - Display main image with thumbnail strip below
    - Implement thumbnail click to change main image
    - Display image counter (X of Y)
    - Handle empty images array (return null)
    - _Requirements: 7.1, 7.2, 7.3, 7.8, 12.1, 12.2, 12.4_
  
  - [x] 5.2 Add lightbox functionality with keyboard navigation
    - Open lightbox on main image click
    - Add previous/next navigation buttons
    - Support keyboard navigation (arrows, escape)
    - Support touch gestures for mobile
    - Close lightbox on escape key or backdrop click
    - _Requirements: 7.4, 7.5, 7.6, 7.9_
  
  - [x] 5.3 Add image loading and error handling
    - Display loading spinner while images load
    - Display error placeholder for failed images
    - Implement lazy loading for images outside viewport
    - Handle both absolute URLs (Cloudinary) and relative URLs
    - _Requirements: 12.5, 12.6, 12.7, 12.9_
  
  - [x] 5.4 Add CSS styling with day/night theme support
    - Create styles in client/src/styles/admin.css or global CSS
    - Ensure consistent styling across day/night themes
    - Add hover effects and transitions
    - Style lightbox overlay and controls
    - _Requirements: 7.7, 7.10, 12.3, 12.10_
  
  - [x] 5.5 Write unit tests for ImageGallery component
    - Test thumbnail navigation
    - Test lightbox open/close
    - Test keyboard navigation
    - Test empty images array
    - Test image load error handling

- [x] 6. Enhance Constructor Directory with workload indicators
  - [x] 6.1 Update ConstructorsList page with grid layout
    - Implement responsive grid (min 320px card width)
    - Display constructor cards with avatar, name, email, phone
    - Sort constructors by activeTasks ascending (least busy first)
    - Ensure day/night theme consistency
    - _Requirements: 1.1, 1.5, 1.6, 1.7_
  
  - [x] 6.2 Add workload level indicators
    - Implement getWorkloadLevel function (0=low, 1-5=medium, 6+=high)
    - Create getWorkloadBadge function with color-coded styling
    - Display workload badge with task count on each card
    - Green for low, yellow for medium, red for high workload
    - _Requirements: 1.2, 1.3, 1.4_
  
  - [x] 6.3 Implement search functionality
    - Add search input field with Search icon
    - Filter by name, email, or phone with 300ms debounce
    - Update filtered results in real-time
    - Display "No constructors found" for empty results
    - _Requirements: 13.1, 13.2, 13.5_
  
  - [x] 6.4 Implement workload filter dropdown
    - Add filter dropdown (all, low, medium, high)
    - Filter constructors by workload level
    - Display total count of visible constructors
    - Preserve search and filter state on navigation
    - _Requirements: 13.3, 13.4, 13.6, 13.7_
  
  - [x] 6.5 Write unit tests for Constructor Directory
    - Test workload level calculation
    - Test search filtering logic
    - Test workload filtering logic
    - Test sorting by active tasks

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Enhance NotificationBell component
  - [x] 8.1 Implement notification fetching and polling
    - Fetch notifications on component mount
    - Implement 60-second polling interval
    - Display unread count with red dot indicator
    - Fetch 20 most recent notifications
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 8.2 Implement notification dropdown display
    - Display notifications in dropdown with type icons
    - Show unread notifications with bold text and highlighted background
    - Display notification time with relative formatting (e.g., "2h ago")
    - Close dropdown when clicking outside
    - _Requirements: 8.5, 8.7_
  
  - [x] 8.3 Implement mark as read functionality
    - Mark notification as read on click
    - Navigate to complaint detail page on notification click
    - Add "Mark all read" button when unread notifications exist
    - Update UI state after marking as read
    - _Requirements: 8.6, 8.8, 8.9_
  
  - [x] 8.4 Add CSS styling for NotificationBell
    - Create styles in client/src/styles/notifications.css
    - Ensure day/night theme consistency
    - Style notification badge, dropdown, and items
    - Add hover effects and transitions
    - _Requirements: 8.10_
  
  - [x] 8.5 Write unit tests for NotificationBell
    - Test unread count display
    - Test mark as read functionality
    - Test mark all as read
    - Test notification click navigation
    - Test polling interval

- [x] 9. Add comprehensive notification triggers
  - [x] 9.1 Add notification on complaint creation
    - Call notificationService.createNotification for citizen
    - Include complaint number in message
    - Set notification type to 'info'
    - _Requirements: 9.1_
  
  - [x] 9.2 Add notifications on constructor status updates
    - Notify citizen when constructor starts work (in_progress)
    - Notify admin when constructor starts work
    - Notify admin and citizen when work completed
    - Include complaint number in all messages
    - Set appropriate notification types (info, success)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 9.3_
  
  - [x] 9.3 Add notifications for admin actions
    - Notify citizen when admin approves completion (closed status)
    - Notify super admin when complaint escalated
    - Notify admin when citizen reopens complaint
    - Include complaint number and set appropriate types
    - _Requirements: 9.5, 9.6, 9.7_
  
  - [x] 9.4 Add error handling and logging for notifications
    - Wrap notification calls in try-catch blocks
    - Log errors with user ID, complaint ID, and error message
    - Continue main operation if notification fails (graceful degradation)
    - _Requirements: 5.7, 9.8, 9.9, 9.10_
  
  - [x] 9.5 Write integration tests for notification triggers
    - Test notification created on assignment
    - Test notification created on status change
    - Test notification created on escalation
    - Test graceful failure when notification service fails

- [x] 10. Implement SLA monitoring cron job
  - [x] 10.1 Enhance SLA monitoring cron job
    - Update cron schedule to run every 15 minutes
    - Query complaints with slaDueDate < now and isSlaBreached=false
    - Set isSlaBreached=true for breached complaints
    - Calculate hours overdue for each breach
    - _Requirements: 14.1, 14.2, 14.7_
  
  - [x] 10.2 Add SLA breach notifications
    - Notify assigned admin with error type notification
    - Notify super admin if complaint is escalated
    - Include complaint number, priority, and hours overdue in message
    - Ensure idempotent notification creation (one per breach)
    - _Requirements: 14.3, 14.4, 14.5, 14.6_
  
  - [x] 10.3 Write integration tests for SLA monitoring
    - Test breach detection for past slaDueDate
    - Test isSlaBreached flag update
    - Test notification creation on breach
    - Test idempotent behavior (no duplicate notifications)

- [x] 11. Add completion photos display in Admin detail page
  - [x] 11.1 Fetch completion history in AdminIssueDetail
    - Create loadCompletionHistory function
    - Fetch ComplaintStatusHistory records with images
    - Filter for status='completed' with images
    - Store in completionHistory state
    - _Requirements: 6.1, 6.3_
  
  - [x] 11.2 Display completion photos section
    - Create dedicated completion section with success styling
    - Display constructor name and avatar
    - Format timestamp as "DD MMM YYYY, HH:MM AM/PM" in IST
    - Display time elapsed (e.g., "2 hours ago")
    - Display constructor comments alongside photos
    - Show "No completion photos uploaded yet" when empty
    - _Requirements: 6.2, 6.4, 6.5, 6.6, 6.7, 15.1, 15.2, 15.3, 15.5, 15.6, 15.7_
  
  - [x] 11.3 Add late upload warning indicator
    - Check if photos uploaded >24h after assignment
    - Display warning indicator for late uploads
    - _Requirements: 15.4_
  
  - [x] 11.4 Integrate ImageGallery for completion photos
    - Use ImageGallery component for completion photos
    - Separate gallery for original photos vs completion photos
    - Pass appropriate title prop to each gallery
    - _Requirements: 7.7, 12.8_
  
  - [x] 11.5 Write integration tests for completion photos display
    - Test completion history fetching
    - Test completion photos rendering
    - Test late upload warning display
    - Test empty state display

- [x] 12. Integrate SLACountdown across all detail pages
  - [x] 12.1 Add SLACountdown to AdminIssueDetail page
    - Import SLACountdown component
    - Pass slaDueDate and isSlaBreached props
    - Position above image galleries
    - _Requirements: 4.6_
  
  - [x] 12.2 Add SLACountdown to ConstructorTaskDetail page
    - Import SLACountdown component
    - Pass slaDueDate and isSlaBreached props
    - Position prominently near task status
    - _Requirements: 4.6_
  
  - [x] 12.3 Add SLACountdown to CitizenIssueDetail page
    - Import SLACountdown component
    - Pass slaDueDate and isSlaBreached props
    - Position in complaint details section
    - _Requirements: 4.6_
  
  - [x] 12.4 Add SLACountdown to SuperAdminIssueDetail page
    - Import SLACountdown component
    - Pass slaDueDate and isSlaBreached props
    - Position in complaint overview section
    - _Requirements: 4.6_
  
  - [x] 12.5 Add SLACountdown to complaint list cards
    - Update complaint card components in all panels
    - Display SLACountdown with size="small" prop
    - Position in card header or metadata section
    - _Requirements: 4.5_

- [x] 13. Integrate ImageGallery across all detail pages
  - [x] 13.1 Update CitizenIssueDetail with ImageGallery
    - Replace existing image display with ImageGallery component
    - Pass complaint.images array
    - Set title to "Original Photos"
    - _Requirements: 12.8_
  
  - [x] 13.2 Update ConstructorTaskDetail with ImageGallery
    - Replace existing image display with ImageGallery component
    - Pass task.images array
    - Set title to "Original Photos (Reported Issue)"
    - _Requirements: 12.8_
  
  - [x] 13.3 Update SuperAdminIssueDetail with ImageGallery
    - Replace existing image display with ImageGallery component
    - Pass complaint.images array
    - Set title to "Original Photos"
    - Add completion photos section if available
    - _Requirements: 12.8_

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Integration and final wiring
  - [x] 15.1 Verify SLA configuration API endpoints
    - Test GET /api/superadmin/sla-config
    - Test PUT /api/superadmin/sla-config with valid data
    - Test PUT with invalid data (hierarchy violation)
    - Verify authorization (super_admin only)
  
  - [x] 15.2 Verify photo upload validation end-to-end
    - Test frontend prevents >5 photo selection
    - Test backend rejects >5 photos
    - Test backend requires ≥1 photo for completion
    - Verify error messages displayed correctly
  
  - [x] 15.3 Verify SLA monitoring cron job
    - Check cron job initialization in server.js
    - Verify 15-minute schedule
    - Test breach detection with mocked time
    - Verify notifications created on breach
  
  - [x] 15.4 Verify notification triggers across all flows
    - Test complaint creation → citizen notified
    - Test assignment → constructor notified
    - Test work started → citizen and admin notified
    - Test work completed → admin and citizen notified
    - Test SLA breach → admin notified
  
  - [x] 15.5 Verify UI components across all panels
    - Test SLACountdown displays correctly in all panels
    - Test ImageGallery works in all detail pages
    - Test NotificationBell polling and mark as read
    - Test Constructor Directory search and filter
  
  - [x] 15.6 Test day/night theme consistency
    - Verify all new components support day/night themes
    - Test SLACountdown color coding in both themes
    - Test ImageGallery lightbox in both themes
    - Test NotificationBell dropdown in both themes
    - Test Constructor Directory cards in both themes
  
  - [ ]* 15.7 Perform manual testing across all user roles
    - Test as citizen (view SLA, receive notifications)
    - Test as constructor (upload photos, see SLA countdown)
    - Test as admin (view completion photos, assign with SLA, use directory)
    - Test as super admin (configure SLA, view breaches)

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical breaks
- The implementation follows a bottom-up approach: backend foundation → components → integration
- All new components support day/night theme consistency
- Photo upload validation is enforced at both frontend and backend layers
- Notification creation uses graceful degradation (logs errors but doesn't fail main operations)
- SLA monitoring runs every 15 minutes to balance responsiveness and server load
