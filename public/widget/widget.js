(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.FeedbackStarWidget) {
    return;
  }

  // Configuration - automatically detect the API base from script source
  function getApiBase() {
    const scriptTag = document.currentScript || 
                     document.querySelector('script[data-project-id]') ||
                     document.querySelector('script[src*="/js/script.js"]');
    
    if (scriptTag && scriptTag.src) {
      const url = new URL(scriptTag.src);
      return `${url.protocol}//${url.host}`;
    }
    
    // Fallback to current page's origin for development
    return window.location.origin;
  }
  
  const CONFIG = {
    API_BASE: getApiBase(),
    WIDGET_ID: 'feedbackstar-widget',
    TRIGGER_ID: 'feedbackstar-trigger',
    MODAL_ID: 'feedbackstar-modal'
  };
  
  console.log('FeedbackWidget API_BASE:', CONFIG.API_BASE);

  class FeedbackWidget {
    constructor(projectId, settings = {}) {
      this.projectId = projectId;
      this.settings = {
        triggerText: settings.triggerText || 'Feedback',
        position: settings.position || 'bottom-right',
        primaryColor: settings.primaryColor || '#3b82f6',
        backgroundColor: settings.backgroundColor || '#ffffff',
        textColor: settings.textColor || '#1f2937',
        ...settings
      };
      
      this.isOpen = false;
      this.init();
    }

    init() {
      this.injectStyles();
      this.createTrigger();
      this.createModal();
      this.bindEvents();
    }

    adjustBrightness(hex, percent) {
      // Remove the hash if it exists
      hex = hex.replace('#', '');
      
      // Parse the hex values
      const num = parseInt(hex, 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    injectStyles() {
      if (document.getElementById('feedbackstar-styles')) return;
      
      const styles = `
        #${CONFIG.TRIGGER_ID} {
          position: fixed;
          z-index: 999998;
          padding: 12px 20px;
          background: linear-gradient(135deg, ${this.settings.primaryColor}, ${this.adjustBrightness(this.settings.primaryColor, -20)});
          color: white;
          border: none;
          border-radius: 8px 0 0 8px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15), -2px 0 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(0);
          opacity: 1;
          display: flex;
          align-items: center;
        }
        
        #${CONFIG.TRIGGER_ID}:hover {
          transform: translateX(-5px);
          box-shadow: -6px 0 25px rgba(0, 0, 0, 0.2), -3px 0 12px rgba(0, 0, 0, 0.15);
        }

        #${CONFIG.TRIGGER_ID}:active {
          transform: translateX(-2px);
        }

        
        #${CONFIG.TRIGGER_ID}.bottom-right {
          bottom: 0;
          right: 0;
          transform: translateX(0);
        }
        
        #${CONFIG.TRIGGER_ID}.bottom-right:hover {
          transform: translateX(-5px);
        }
        
        #${CONFIG.TRIGGER_ID}.bottom-right:active {
          transform: translateX(-2px);
        }
        
        #${CONFIG.TRIGGER_ID}.bottom-left {
          bottom: 50%;
          left: 0;
          transform: translateY(50%);
          border-radius: 0 8px 8px 0;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15), 2px 0 8px rgba(0, 0, 0, 0.1);
        }
        
        #${CONFIG.TRIGGER_ID}.bottom-left:hover {
          transform: translateY(50%) translateX(5px);
        }
        
        #${CONFIG.TRIGGER_ID}.bottom-left:active {
          transform: translateY(50%) translateX(2px);
        }
        
        #${CONFIG.TRIGGER_ID}.top-right {
          top: 50%;
          right: 0;
          transform: translateY(-50%);
        }
        
        #${CONFIG.TRIGGER_ID}.top-left {
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          border-radius: 0 8px 8px 0;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15), 2px 0 8px rgba(0, 0, 0, 0.1);
        }

        #${CONFIG.MODAL_ID} {
          position: fixed;
          bottom: 0;
          right: 0;
          transform: translateY(100%);
          z-index: 1000000;
          display: block;
          opacity: 0;
          visibility: hidden;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          max-width: 420px;
          padding: 0 20px 20px 20px;
        }

        #${CONFIG.MODAL_ID}.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        @media (max-width: 480px) {
          #${CONFIG.MODAL_ID} {
            max-width: 100%;
            padding: 0 15px 15px 15px;
          }
        }

        .feedbackstar-modal-content {
          background-color: ${this.settings.backgroundColor};
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          font-family: system-ui, -apple-system, sans-serif;
          color: ${this.settings.textColor};
          box-shadow: 0 -10px 50px rgba(0, 0, 0, 0.15), 0 -4px 20px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }

        .feedbackstar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 999999;
          display: block;
          opacity: 0;
          visibility: hidden;
          transition: all 0.5s ease;
          backdrop-filter: blur(3px);
        }

        .feedbackstar-backdrop.show {
          opacity: 1;
          visibility: visible;
        }

        .feedbackstar-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #9ca3af;
          padding: 4px;
          line-height: 1;
        }

        .feedbackstar-close:hover {
          color: #6b7280;
        }

        .feedbackstar-title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1f2937;
        }

        .feedbackstar-description {
          color: #4b5563;
          margin-bottom: 24px;
          font-size: 15px;
          line-height: 1.5;
        }

        .feedbackstar-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feedbackstar-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .feedbackstar-label {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
        }

        .feedbackstar-required {
          color: #ef4444;
        }

        .feedbackstar-input,
        .feedbackstar-textarea,
        .feedbackstar-select {
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          background-color: #ffffff;
          color: #1f2937;
          transition: border-color 0.2s ease;
          line-height: 1.4;
        }

        .feedbackstar-input:focus,
        .feedbackstar-textarea:focus,
        .feedbackstar-select:focus {
          outline: none;
          border-color: ${this.settings.primaryColor};
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .feedbackstar-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .feedbackstar-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .feedbackstar-button {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .feedbackstar-button-primary {
          background-color: ${this.settings.primaryColor};
          color: white;
        }

        .feedbackstar-button-primary:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .feedbackstar-button-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .feedbackstar-button-secondary {
          background-color: transparent;
          color: #6b7280;
          border-color: #d1d5db;
        }

        .feedbackstar-button-secondary:hover {
          background-color: #f9fafb;
        }

        .feedbackstar-success {
          text-align: center;
          padding: 40px 20px;
        }

        .feedbackstar-success-icon {
          font-size: 48px;
          color: #10b981;
          margin-bottom: 16px;
        }

        .feedbackstar-success-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: ${this.settings.textColor};
        }

        .feedbackstar-success-message {
          color: #6b7280;
          font-size: 14px;
        }

        .feedbackstar-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .feedbackstar-star {
          font-size: 24px;
          color: #d1d5db;
          cursor: pointer;
          transition: color 0.2s ease;
          user-select: none;
        }

        .feedbackstar-star:hover,
        .feedbackstar-star.active {
          color: #fbbf24;
        }

        .feedbackstar-star.filled {
          color: #f59e0b;
        }

        @media (max-width: 640px) {
          #${CONFIG.MODAL_ID} {
            bottom: 0;
            right: 0;
            left: 0;
            margin: 0;
          }
          
          .feedbackstar-modal-content {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 20px;
            border-radius: 16px 16px 0 0;
            max-height: 80vh;
          }
          
          .feedbackstar-buttons {
            flex-direction: column;
          }
          
          .feedbackstar-button {
            width: 100%;
          }

          #${CONFIG.TRIGGER_ID} {
            padding: 10px 16px;
            font-size: 13px;
          }

          #${CONFIG.TRIGGER_ID}::before {
            font-size: 14px;
          }
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.id = 'feedbackstar-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    createTrigger() {
      const trigger = document.createElement('button');
      trigger.id = CONFIG.TRIGGER_ID;
      trigger.className = this.settings.position;
      trigger.textContent = this.settings.triggerText;
      trigger.setAttribute('aria-label', 'Open feedback form');
      
      document.body.appendChild(trigger);
    }

    createModal() {
      // Create backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'feedbackstar-backdrop';
      backdrop.id = 'feedbackstar-backdrop';
      
      // Create modal
      const modal = document.createElement('div');
      modal.id = CONFIG.MODAL_ID;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-labelledby', 'feedbackstar-title');
      modal.setAttribute('aria-hidden', 'true');
      
      modal.innerHTML = `
        <div class="feedbackstar-modal-content">
          <button class="feedbackstar-close" aria-label="Close feedback form">×</button>
          <div id="feedbackstar-form-view">
            <h2 id="feedbackstar-title" class="feedbackstar-title">Send Feedback</h2>
            <p class="feedbackstar-description">Help us improve by sharing your thoughts!</p>
            <form class="feedbackstar-form" id="feedbackstar-form">
              <div class="feedbackstar-field">
                <label for="feedbackstar-message" class="feedbackstar-label">
                  What's on your mind? <span class="feedbackstar-required">*</span>
                </label>
                <textarea 
                  id="feedbackstar-message" 
                  name="message" 
                  class="feedbackstar-textarea" 
                  placeholder="Tell us what you think..."
                  required
                ></textarea>
              </div>
              <div class="feedbackstar-field">
                <label for="feedbackstar-category" class="feedbackstar-label">
                  What type of feedback? <span class="feedbackstar-required">*</span>
                </label>
                <select id="feedbackstar-category" name="category" class="feedbackstar-select" required>
                  <option value="">Select a category</option>
                  <option value="general">General</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="praise">Praise</option>
                </select>
              </div>
              <div class="feedbackstar-field">
                <label for="feedbackstar-email" class="feedbackstar-label">
                  Want a reply? (Optional)
                </label>
                <input 
                  type="email" 
                  id="feedbackstar-email" 
                  name="email" 
                  class="feedbackstar-input" 
                  placeholder="your@email.com"
                />
              </div>
              <div class="feedbackstar-field">
                <label class="feedbackstar-label">
                  Rate your experience (Optional)
                </label>
                <div class="feedbackstar-rating" id="feedbackstar-rating">
                  <span class="feedbackstar-star" data-rating="1">★</span>
                  <span class="feedbackstar-star" data-rating="2">★</span>
                  <span class="feedbackstar-star" data-rating="3">★</span>
                  <span class="feedbackstar-star" data-rating="4">★</span>
                  <span class="feedbackstar-star" data-rating="5">★</span>
                </div>
                <input type="hidden" id="feedbackstar-rating-value" name="rating" value="">
              </div>
              <div class="feedbackstar-buttons">
                <button type="button" class="feedbackstar-button feedbackstar-button-secondary" id="feedbackstar-cancel">
                  Cancel
                </button>
                <button type="submit" class="feedbackstar-button feedbackstar-button-primary" id="feedbackstar-submit">
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
          <div id="feedbackstar-success-view" style="display: none;">
            <div class="feedbackstar-success">
              <div class="feedbackstar-success-icon">✓</div>
              <h2 class="feedbackstar-success-title">Thank you!</h2>
              <p class="feedbackstar-success-message">
                Your feedback has been sent successfully. We appreciate you taking the time to help us improve!
              </p>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(backdrop);
      document.body.appendChild(modal);
    }

    bindEvents() {
      const trigger = document.getElementById(CONFIG.TRIGGER_ID);
      const modal = document.getElementById(CONFIG.MODAL_ID);
      const backdrop = document.getElementById('feedbackstar-backdrop');
      const closeBtn = modal.querySelector('.feedbackstar-close');
      const cancelBtn = modal.querySelector('#feedbackstar-cancel');
      const form = modal.querySelector('#feedbackstar-form');

      // Open modal
      trigger.addEventListener('click', () => this.openModal());

      // Close modal
      closeBtn.addEventListener('click', () => this.closeModal());
      cancelBtn.addEventListener('click', () => this.closeModal());
      
      // Close on backdrop click
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.closeModal();
        }
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeModal();
        }
      });

      // Handle form submission
      form.addEventListener('submit', (e) => this.handleSubmit(e));

      // Handle star rating
      const stars = modal.querySelectorAll('.feedbackstar-star');
      const ratingInput = modal.querySelector('#feedbackstar-rating-value');
      
      stars.forEach((star, index) => {
        star.addEventListener('click', () => {
          const rating = index + 1;
          ratingInput.value = rating;
          
          // Update visual state
          stars.forEach((s, i) => {
            s.classList.toggle('filled', i < rating);
          });
        });
        
        star.addEventListener('mouseenter', () => {
          stars.forEach((s, i) => {
            s.classList.toggle('active', i <= index);
          });
        });
      });
      
      // Reset hover state on mouse leave
      modal.querySelector('.feedbackstar-rating').addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('active'));
      });
    }

    openModal() {
      const modal = document.getElementById(CONFIG.MODAL_ID);
      const backdrop = document.getElementById('feedbackstar-backdrop');
      
      this.isOpen = true;
      backdrop.classList.add('show');
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      
      // Focus management
      setTimeout(() => {
        const firstInput = modal.querySelector('#feedbackstar-message');
        if (firstInput) {
          firstInput.focus();
        }
      }, 500);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    closeModal() {
      const modal = document.getElementById(CONFIG.MODAL_ID);
      const backdrop = document.getElementById('feedbackstar-backdrop');
      
      this.isOpen = false;
      modal.classList.remove('show');
      backdrop.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      
      // Wait for animation to complete before cleanup
      setTimeout(() => {
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Reset form
        this.resetForm();
      }, 500);
    }

    resetForm() {
      const formView = document.getElementById('feedbackstar-form-view');
      const successView = document.getElementById('feedbackstar-success-view');
      const form = document.getElementById('feedbackstar-form');
      
      formView.style.display = 'block';
      successView.style.display = 'none';
      form.reset();
      
      // Reset star rating
      const stars = document.querySelectorAll('.feedbackstar-star');
      const ratingInput = document.getElementById('feedbackstar-rating-value');
      if (stars && ratingInput) {
        stars.forEach(star => {
          star.classList.remove('filled', 'active');
        });
        ratingInput.value = '';
      }
      
      // Re-enable submit button
      const submitBtn = document.getElementById('feedbackstar-submit');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback';
    }

    async handleSubmit(e) {
      e.preventDefault();
      
      const submitBtn = document.getElementById('feedbackstar-submit');
      const formData = new FormData(e.target);
      
      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      try {
        const payload = {
          projectId: this.projectId,
          message: formData.get('message'),
          category: formData.get('category'),
          userEmail: formData.get('email') || null,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          metadata: {
            browserInfo: this.getBrowserInfo(),
            screenResolution: `${screen.width}x${screen.height}`,
            device: this.getDeviceType(),
            referrer: document.referrer || null,
            timestamp: new Date().toISOString()
          }
        };

        const response = await fetch(`${CONFIG.API_BASE}/api/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Show success view
        this.showSuccess();
        
      } catch (error) {
        console.error('Failed to submit feedback:', error);
        alert('Failed to send feedback. Please try again.');
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Feedback';
      }
    }

    showSuccess() {
      const formView = document.getElementById('feedbackstar-form-view');
      const successView = document.getElementById('feedbackstar-success-view');
      
      formView.style.display = 'none';
      successView.style.display = 'block';
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        this.closeModal();
      }, 3000);
    }

    getBrowserInfo() {
      const ua = navigator.userAgent;
      let browser = 'Unknown';
      
      if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';
      
      return browser;
    }

    getDeviceType() {
      const width = window.innerWidth;
      if (width < 768) return 'Mobile';
      if (width < 1024) return 'Tablet';
      return 'Desktop';
    }
  }

  // Expose FeedbackWidget globally for manual initialization
  window.FeedbackWidget = FeedbackWidget;

  // Initialize widget
  function initializeWidget() {
    const scripts = document.querySelectorAll('script[data-project-id]');
    const script = scripts[scripts.length - 1]; // Get the current script
    
    // If no script with data-project-id found, skip auto-initialization
    if (!script) {
      console.log('FeedbackStar: No auto-initialization script found. Use new FeedbackWidget(projectId) manually.');
      return;
    }
    
    const projectId = script.getAttribute('data-project-id');
    
    if (!projectId) {
      console.error('FeedbackStar: Missing data-project-id attribute');
      return;
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.FeedbackStarWidget = new FeedbackWidget(projectId);
      });
    } else {
      window.FeedbackStarWidget = new FeedbackWidget(projectId);
    }
  }

  // Initialize when script loads
  initializeWidget();

})();