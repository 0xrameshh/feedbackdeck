(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.FeedbackStarWidget) {
    return;
  }

  // Configuration
  function getApiBase() {
    const scriptTag = document.currentScript || 
                     document.querySelector('script[data-project-id]') ||
                     document.querySelector('script[src*="/widget/widget.js"]');
    
    if (scriptTag && scriptTag.src) {
      const url = new URL(scriptTag.src);
      return `${url.protocol}//${url.host}`;
    }
    
    return window.location.origin;
  }
  
  const CONFIG = {
    API_BASE: getApiBase(),
    WIDGET_ID: 'feedbackstar-widget',
    TRIGGER_ID: 'feedbackstar-trigger',
    MODAL_ID: 'feedbackstar-modal'
  };

  class FeedbackWidget {
    constructor(projectId, settings = {}) {
      this.projectId = projectId;
      this.settings = {
        triggerText: 'Feedback',
        primaryColor: '#ea580c',
        ...settings
      };
      
      this.isOpen = false;
      this.rating = 0;
      this.hoveredStar = 0;
      this.init();
    }

    async init() {
      // Render immediately with defaults; fetch settings in background
      this.injectStyles();
      this.createTrigger();
      this.createModal();
      this.bindEvents();

      // Load project-specific settings without blocking initial render
      this.loadProjectSettings()
        .then(() => {
          try { this.applySettings(); } catch (e) { console.warn('Apply settings failed:', e); }
        })
        .catch((err) => console.warn('Could not load project settings, using defaults:', err));
    }

    async loadProjectSettings() {
      try {
        const response = await fetch(`${CONFIG.API_BASE}/api/projects/${this.projectId}/settings`);
        if (response.ok) {
          const projectSettings = await response.json();
          this.settings = {
            ...this.settings,
            ...projectSettings.widgetSettings
          };
        }
      } catch (error) {
        console.warn('Could not load project settings, using defaults:', error);
      }
    }

    injectStyles() {
      const styles = `
        /* FeedbackStar Logo */
        .feedbackstar-logo {
          width: 18px;
          height: 18px;
          background-image: url("${CONFIG.API_BASE}/icon-192.png");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }

        /* Trigger Button */
        #${CONFIG.TRIGGER_ID} {
          position: fixed;
          bottom: 0;
          right: 30px;
          z-index: 999999;
          padding: 12px 20px;
          background: linear-gradient(135deg, ${this.settings.primaryColor}, ${this.darkenColor(this.settings.primaryColor, 20)});
          color: white;
          border: none;
          border-radius: 12px 12px 0 0;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 1;
          visibility: visible;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          font-weight: 600;
        }

        #${CONFIG.TRIGGER_ID}:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        #${CONFIG.TRIGGER_ID}:active {
          transform: translateY(-1px);
        }

        #${CONFIG.TRIGGER_ID}.hidden {
          opacity: 0;
          visibility: hidden;
          transform: scale(0.8);
        }

        /* Backdrop */
        .feedbackstar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 999998;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .feedbackstar-backdrop.show {
          opacity: 1;
          visibility: visible;
        }

        /* Modal */
        #${CONFIG.MODAL_ID} {
          position: fixed;
          bottom: 0;
          right: 30px;
          z-index: 1000000;
          width: 320px;
          max-width: calc(100vw - 40px);
          transform: translateY(100%);
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        #${CONFIG.MODAL_ID}.show {
          transform: translateY(-70px);
          opacity: 1;
          visibility: visible;
        }

        /* Modal Content */
        .feedbackstar-modal-content {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(16px);
          border-radius: 24px 24px 24px 0;
          padding: 24px;
          box-shadow: 0 -10px 50px rgba(0, 0, 0, 0.25), 0 -4px 20px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1f2937;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .feedbackstar-modal-content {
            background: rgba(31, 41, 55, 0.98);
            color: #f9fafb;
            border-color: rgba(255, 255, 255, 0.1);
          }
          
          .feedbackstar-input,
          .feedbackstar-textarea {
            background: rgba(55, 65, 81, 0.8) !important;
            border-color: rgba(75, 85, 99, 0.6) !important;
            color: #f9fafb !important;
          }
        }

        /* Header */
        .feedbackstar-header {
          background: linear-gradient(135deg, ${this.settings.primaryColor}, ${this.darkenColor(this.settings.primaryColor, 10)});
          margin: -24px -24px 24px -24px;
          padding: 16px 24px;
          border-radius: 24px 24px 0 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
        }

        .feedbackstar-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .feedbackstar-header-logo {
          padding: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .feedbackstar-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }

        .feedbackstar-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.2s ease;
        }

        .feedbackstar-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          transform: scale(1.1);
        }

        /* Form */
        .feedbackstar-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feedbackstar-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .feedbackstar-label {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }

        @media (prefers-color-scheme: dark) {
          .feedbackstar-label {
            color: #f9fafb;
          }
        }

        .feedbackstar-rating-label {
          text-align: center;
          margin-bottom: 8px;
        }

        /* Star Rating */
        .feedbackstar-rating {
          display: flex;
          justify-content: center;
          gap: 1px;
          padding: 8px;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 10px;
          margin-bottom: 4px;
        }

        @media (prefers-color-scheme: dark) {
          .feedbackstar-rating {
            background: rgba(255, 255, 255, 0.05);
          }
        }

        .feedbackstar-star {
          font-size: 20px;
          color: #d1d5db;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 4px;
          border-radius: 6px;
          user-select: none;
        }

        .feedbackstar-star:hover,
        .feedbackstar-star.active {
          color: #f59e0b;
          transform: scale(1.1);
          background: rgba(245, 158, 11, 0.1);
        }

        .feedbackstar-star.filled {
          color: #f59e0b;
          transform: scale(1.1);
        }

        /* Rating Messages */
        .feedbackstar-rating-message {
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          min-height: 16px;
          transition: all 0.3s ease;
        }

        /* Inputs */
        .feedbackstar-input,
        .feedbackstar-textarea,
        .feedbackstar-select {
          padding: 10px 14px;
          border: 2px solid rgba(209, 213, 219, 0.6);
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.7);
          color: #1f2937;
          transition: all 0.3s ease;
          outline: none;
        }

        .feedbackstar-input:focus,
        .feedbackstar-textarea:focus,
        .feedbackstar-select:focus {
          border-color: ${this.settings.primaryColor};
          box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1);
          background: rgba(255, 255, 255, 0.9);
        }

        .feedbackstar-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 10px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 36px;
        }

        .feedbackstar-textarea {
          resize: vertical;
          min-height: 70px;
        }

        .feedbackstar-input::placeholder,
        .feedbackstar-textarea::placeholder {
          color: #9ca3af;
        }

        /* Submit Button */
        .feedbackstar-submit {
          background: linear-gradient(135deg, ${this.settings.primaryColor}, ${this.darkenColor(this.settings.primaryColor, 10)});
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
        }

        .feedbackstar-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(234, 88, 12, 0.4);
        }

        .feedbackstar-submit:active {
          transform: translateY(0);
        }

        .feedbackstar-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Success State */
        .feedbackstar-success {
          text-align: center;
          padding: 32px 20px;
        }

        .feedbackstar-success-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 24px;
          color: white;
        }

        .feedbackstar-success-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1f2937;
        }

        .feedbackstar-success-message {
          font-size: 14px;
          color: #6b7280;
        }

        @media (prefers-color-scheme: dark) {
          .feedbackstar-success-title {
            color: #f9fafb;
          }
          .feedbackstar-success-message {
            color: #9ca3af;
          }
        }

        /* Branding */
        .feedbackstar-branding {
          text-align: center;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        @media (prefers-color-scheme: dark) {
          .feedbackstar-branding {
            border-top-color: rgba(255, 255, 255, 0.1);
          }
        }

        .feedbackstar-branding a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
          text-decoration: none;
          transition: all 0.2s ease;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid transparent;
        }

        .feedbackstar-branding a:hover {
          color: ${this.settings.primaryColor};
          border-color: rgba(234, 88, 12, 0.2);
          background: rgba(234, 88, 12, 0.05);
          transform: scale(1.05);
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          #${CONFIG.MODAL_ID} {
            bottom: 0;
            right: 0;
            left: 0;
            width: auto;
            max-width: none;
          }
          
          #${CONFIG.MODAL_ID}.show {
            transform: translateY(0);
          }
          
          .feedbackstar-modal-content {
            border-radius: 24px 24px 0 0;
            max-height: 80vh;
            overflow-y: auto;
          }
        }
      `;

      const existing = document.getElementById('feedbackstar-styles');
      if (existing) {
        existing.textContent = styles;
        return;
      }

      const styleSheet = document.createElement('style');
      styleSheet.id = 'feedbackstar-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    applySettings() {
      // Update trigger text
      const trigger = document.getElementById(CONFIG.TRIGGER_ID);
      if (trigger) {
        trigger.innerHTML = `<span>${this.settings.triggerText}</span>`;
      }
      // Rebuild styles to reflect any color changes
      this.injectStyles();
    }

    darkenColor(hex, percent) {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) - amt;
      const G = (num >> 8 & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    createTrigger() {
      const trigger = document.createElement('button');
      trigger.id = CONFIG.TRIGGER_ID;
      trigger.innerHTML = `
        <span>${this.settings.triggerText}</span>
      `;
      trigger.setAttribute('aria-label', 'Open feedback form');
      
      document.body.appendChild(trigger);
    }

    createModal() {
      const backdrop = document.createElement('div');
      backdrop.className = 'feedbackstar-backdrop';
      backdrop.id = 'feedbackstar-backdrop';
      
      const modal = document.createElement('div');
      modal.id = CONFIG.MODAL_ID;
      modal.innerHTML = `
        <div class="feedbackstar-modal-content">
          <div class="feedbackstar-header">
            <div class="feedbackstar-header-left">
              <h3 class="feedbackstar-title">Share Your Feedback</h3>
            </div>
            <button class="feedbackstar-close">×</button>
          </div>
          
          <div id="feedbackstar-form-view">
            <form class="feedbackstar-form" id="feedbackstar-form">
              <div class="feedbackstar-field">
                <label class="feedbackstar-label feedbackstar-rating-label">Rate your experience</label>
                <div class="feedbackstar-rating" id="feedbackstar-rating">
                  <span class="feedbackstar-star" data-rating="1">★</span>
                  <span class="feedbackstar-star" data-rating="2">★</span>
                  <span class="feedbackstar-star" data-rating="3">★</span>
                  <span class="feedbackstar-star" data-rating="4">★</span>
                  <span class="feedbackstar-star" data-rating="5">★</span>
                </div>
                <div class="feedbackstar-rating-message" id="feedbackstar-rating-message"></div>
              </div>
              
              <div class="feedbackstar-field">
                <label class="feedbackstar-label">Type of feedback</label>
                <select id="feedbackstar-category" class="feedbackstar-select">
                  <option value="general">💬 General feedback</option>
                  <option value="bug">🐛 Bug report</option>
                  <option value="feature">✨ Feature request</option>
                  <option value="praise">🎉 Praise</option>
                </select>
              </div>
              
              <div class="feedbackstar-field">
                <label class="feedbackstar-label">
                  Tell us more <span style="color: #9ca3af; font-weight: normal;">(optional)</span>
                </label>
                <textarea 
                  id="feedbackstar-message" 
                  class="feedbackstar-textarea" 
                  placeholder="Share your thoughts, suggestions, or what we can improve..."
                ></textarea>
              </div>
              
              <div class="feedbackstar-field">
                <label class="feedbackstar-label">
                  Email <span style="color: #9ca3af; font-weight: normal;">(for follow-up)</span>
                </label>
                <input 
                  type="email" 
                  id="feedbackstar-email" 
                  class="feedbackstar-input" 
                  placeholder="your@email.com"
                />
              </div>
              
              <button type="submit" class="feedbackstar-submit" id="feedbackstar-submit">
                Send Feedback
              </button>
            </form>
          </div>
          
          <div id="feedbackstar-success-view" style="display: none;">
            <div class="feedbackstar-success">
              <div class="feedbackstar-success-icon">✓</div>
              <h4 class="feedbackstar-success-title">Thank you!</h4>
              <p class="feedbackstar-success-message">Your feedback helps us improve</p>
            </div>
          </div>
          
          <div class="feedbackstar-branding">
            <a href="https://feedbackstar.vercel.app" target="_blank" rel="noopener noreferrer">
              <span style="font-weight: 500;">Powered by</span>
              <div class="feedbackstar-logo"></div>
              <span style="font-weight: 600;">FeedbackStar</span>
              <span style="font-size: 10px;">↗</span>
            </a>
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
      const form = modal.querySelector('#feedbackstar-form');
      const stars = modal.querySelectorAll('.feedbackstar-star');
      const ratingMessage = modal.querySelector('#feedbackstar-rating-message');

      // Open modal
      trigger.addEventListener('click', () => this.openModal());

      // Close modal
      closeBtn.addEventListener('click', () => this.closeModal());
      backdrop.addEventListener('click', () => this.closeModal());

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeModal();
        }
      });

      // Star rating
      stars.forEach((star, index) => {
        star.addEventListener('click', () => {
          this.rating = index + 1;
          this.updateStars();
          this.updateRatingMessage();
        });
        
        star.addEventListener('mouseenter', () => {
          this.hoveredStar = index + 1;
          this.updateStars();
        });
      });

      const ratingContainer = modal.querySelector('.feedbackstar-rating');
      ratingContainer.addEventListener('mouseleave', () => {
        this.hoveredStar = 0;
        this.updateStars();
      });

      // Form submission
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    updateStars() {
      const stars = document.querySelectorAll('.feedbackstar-star');
      const displayRating = this.hoveredStar || this.rating;
      
      stars.forEach((star, index) => {
        star.classList.toggle('filled', index < this.rating);
        star.classList.toggle('active', index < displayRating);
      });
    }

    updateRatingMessage() {
      const messages = {
        1: "We're sorry to hear that 😔",
        2: "We'll work on improving 💪", 
        3: "Thanks for your feedback 👍",
        4: "Glad you liked it! 😊",
        5: "Awesome! Thank you! 🎉"
      };
      
      const messageEl = document.getElementById('feedbackstar-rating-message');
      messageEl.textContent = this.rating > 0 ? messages[this.rating] : '';
    }

    openModal() {
      const modal = document.getElementById(CONFIG.MODAL_ID);
      const backdrop = document.getElementById('feedbackstar-backdrop');
      const trigger = document.getElementById(CONFIG.TRIGGER_ID);
      
      this.isOpen = true;
      backdrop.classList.add('show');
      modal.classList.add('show');
      trigger.classList.add('hidden');
      
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => {
        const messageInput = document.getElementById('feedbackstar-message');
        if (messageInput) messageInput.focus();
      }, 400);
    }

    closeModal() {
      const modal = document.getElementById(CONFIG.MODAL_ID);
      const backdrop = document.getElementById('feedbackstar-backdrop');
      const trigger = document.getElementById(CONFIG.TRIGGER_ID);
      
      this.isOpen = false;
      modal.classList.remove('show');
      backdrop.classList.remove('show');
      trigger.classList.remove('hidden');
      
      setTimeout(() => {
        document.body.style.overflow = '';
        this.resetForm();
      }, 400);
    }

    resetForm() {
      const form = document.getElementById('feedbackstar-form');
      const formView = document.getElementById('feedbackstar-form-view');
      const successView = document.getElementById('feedbackstar-success-view');
      const submitBtn = document.getElementById('feedbackstar-submit');
      
      form.reset();
      formView.style.display = 'block';
      successView.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback';
      
      this.rating = 0;
      this.hoveredStar = 0;
      this.updateStars();
      this.updateRatingMessage();
    }

    async handleSubmit(e) {
      e.preventDefault();
      
      const submitBtn = document.getElementById('feedbackstar-submit');
      const message = document.getElementById('feedbackstar-message').value;
      const email = document.getElementById('feedbackstar-email').value;
      const category = document.getElementById('feedbackstar-category').value;
      
      if (this.rating === 0) {
        alert('Please rate your experience before submitting');
        return;
      }
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      try {
        const payload = {
          projectId: this.projectId,
          rating: this.rating,
          message: message || '',
          email: email || null,
          category: category || 'general',
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          metadata: {
            browserInfo: this.getBrowserInfo(),
            screenResolution: `${screen.width}x${screen.height}`,
            device: this.getDeviceType(),
            referrer: document.referrer || null,
            timestamp: new Date().toISOString(),
            os: this.getOperatingSystem(),
            language: navigator.language || navigator.userLanguage,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            route: window.location.pathname
          }
        };

        const response = await fetch(`${CONFIG.API_BASE}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        this.showSuccess();
        
      } catch (error) {
        console.error('Failed to submit feedback:', error);
        alert('Failed to send feedback. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Feedback';
      }
    }

    showSuccess() {
      const formView = document.getElementById('feedbackstar-form-view');
      const successView = document.getElementById('feedbackstar-success-view');
      
      formView.style.display = 'none';
      successView.style.display = 'block';
      
      setTimeout(() => this.closeModal(), 2500);
    }

    getBrowserInfo() {
      const ua = navigator.userAgent;
      let browser = 'Unknown';
      let version = '';
      
      if (ua.includes('Firefox')) {
        browser = 'Firefox';
        const match = ua.match(/Firefox\/([0-9]+)/);
        version = match ? match[1] : '';
      } else if (ua.includes('Chrome')) {
        browser = 'Chrome';
        const match = ua.match(/Chrome\/([0-9]+)/);
        version = match ? match[1] : '';
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        browser = 'Safari';
        const match = ua.match(/Version\/([0-9]+)/);
        version = match ? match[1] : '';
      } else if (ua.includes('Edge')) {
        browser = 'Edge';
        const match = ua.match(/Edge\/([0-9]+)/);
        version = match ? match[1] : '';
      }
      
      return version ? `${browser} ${version}` : browser;
    }

    getOperatingSystem() {
      const ua = navigator.userAgent;
      
      if (ua.includes('Windows')) return 'Windows';
      if (ua.includes('Mac OS')) return 'macOS';
      if (ua.includes('Linux')) return 'Linux';
      if (ua.includes('Android')) return 'Android';
      if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
      
      return 'Unknown';
    }

    getDeviceType() {
      const ua = navigator.userAgent;
      const width = window.innerWidth;
      
      // Mobile detection
      if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        if (ua.includes('iPad') || (width >= 768 && width <= 1024)) return 'Tablet';
        return 'Mobile';
      }
      
      // Desktop detection by screen size
      if (width < 768) return 'Mobile';
      if (width < 1024) return 'Tablet';
      return 'Desktop';
    }
  }

  // Initialize widget
  function initializeWidget() {
    const scripts = document.querySelectorAll('script[data-project-id]');
    const script = scripts[scripts.length - 1];
    if (!script) return;

    const projectId = script.getAttribute('data-project-id');
    if (!projectId) {
      console.error('FeedbackStar: Missing data-project-id attribute');
      return;
    }

    // Read initial settings from data-* attributes to avoid flash of defaults
    const ds = script.dataset || {};
    const initialSettings = {};
    if (ds.triggerText) initialSettings.triggerText = ds.triggerText;
    if (ds.primaryColor) initialSettings.primaryColor = ds.primaryColor;

    const run = () => {
      window.FeedbackStarWidget = new FeedbackWidget(projectId, initialSettings);
    };

    // Mount as soon as body is ready (handles async/ defer/ inline)
    if (document.body) {
      run();
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      const obs = new MutationObserver(() => {
        if (document.body) { obs.disconnect(); run(); }
      });
      obs.observe(document.documentElement, { childList: true });
      // Fallback timeout in unlikely case body never appears via observer
      setTimeout(() => { if (!window.FeedbackStarWidget && document.body) run(); }, 2000);
    }
  }

  // Expose globally
  window.FeedbackWidget = FeedbackWidget;
  
  // Initialize
  initializeWidget();

})();
