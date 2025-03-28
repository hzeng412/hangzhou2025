// Desktop and Mobile Navigation SubLinks Handling
const navItems = document.querySelectorAll('.main-nav-bar li, .mobile-nav-box li');

navItems.forEach(item => {
      // Check if the item has subLinks in the original links array
      const hasSubLinks = item.getAttribute('data-has-sublinks') === 'true';
      
      if (hasSubLinks) {
         // Create sublinks container
         const subLinksContainer = document.createElement('ul');
         subLinksContainer.classList.add('sub-links');
         
         // Parse and add sublinks
         const subLinksData = JSON.parse(item.getAttribute('data-sublinks'));
         subLinksData.forEach(subLink => {
            const subLinkItem = document.createElement('li');
            const subLinkAnchor = document.createElement('a');

            subLinkItem.classList.add('link');
            subLinkItem.classList.add('link-hover');
            subLinkAnchor.classList.add('link-click');

            subLinkAnchor.href = subLink.link;
            subLinkAnchor.textContent = subLink.text;

            if (subLink?.anchor) {
               subLinkAnchor.setAttribute('data-anchor-target', subLink.anchor);
               subLinkAnchor.setAttribute('data-page-title', subLink.text);
            }
            
            if (subLink.openInNewTab) {
                  subLinkAnchor.target = '_blank';
                  subLinkAnchor.rel = 'noopener noreferrer';
            }
            
            subLinkItem.appendChild(subLinkAnchor);
            subLinksContainer.appendChild(subLinkItem);
         });
         
         item.appendChild(subLinksContainer);
         
         // Mobile toggle functionality
         item.addEventListener('click', (e) => {
            // Prevent immediate navigation if sublinks exist
            if (hasSubLinks) {
               item.classList.toggle('active');
            }
         });
      }
});

gsap.registerPlugin(ScrollTrigger);

let scroll;
let transitionOffset = 800;

initPageTransitions();

// Animation - Page Loader
function initLoaderShort() { 
   var tl = gsap.timeline();

   tl.set("html", { 
      cursor: "wait"
   });

   tl.set("html", { 
      cursor: "auto",
   });

   // Set overflow: hidden before animations
   tl.set(".main-nav-bar ul", {
      overflow: "hidden"
   });

   tl.set(".transition-screen", {
      opacity: 1,
      yPercent: 100,
      rotate: 0.001
   });
   
   tl.call(function() {
      pageTransitionOut();
      $('.loading-container').addClass('loaded');
   }, null, 0);

   tl.call(function() {
	   document.querySelector('.main-nav-bar ul').style.overflow = 'unset';
	});
}

// Animation - Page Loader
function initLoaderHome(isInitialLoad = false) { 
   var tl = gsap.timeline();

   if (!isInitialLoad) {
      tl.set("html", { 
         cursor: "wait"
      });

      tl.set("html", { 
         cursor: "auto",
      });

      tl.set(".transition-screen", {
         opacity: 0,
         yPercent: 100,
         rotate: 0.001
      });

      tl.set(".main-nav-bar", {
         opacity: 0
      });

      tl.set(".presented-by .wrap > *", {
         yPercent: 150
      });

      tl.set(".event-facts > *", {
         y: "2em"
      });

      tl.set(".logo-gosim-scroll", {
         pointerEvents: "none"
      });

      tl.set(".presented-by, .logo-gosim-scroll", {
         opacity: 1
      });

      tl.set(".fade-in-last", {
         opacity: 0,
         y: "2em",
      });

      tl.to(".section-home-header .overlay-background img, .section-home-header .overlay-background .styled-video", {
         duration: 3,
         ease: "none",
         opacity: 1
      });

      tl.to(".presented-by .wrap > *", {
         duration: 1.2,
         ease: "Expo.easeOut",
         yPercent: 0,
         stagger: 0.2,
      }, "< 0.2");

      tl.to(".loading-gosim", {
         duration: 1.2,
         ease: "Expo.easeOut",
         opacity: 1,
      }, "<");

      tl.to(".presented-by .wrap .loading-overlay-svg", {
         duration: 1.6,
         ease: "Expo.easeInOut",
         clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      }, "< 0.4");

      tl.from(".loading-gosim .status", {
         duration: 1.6,
         ease: "Expo.easeInOut",
         xPercent: -101,
      }, "<");

      tl.from(".loading-gosim .loading-percentage", {
         duration: 1.6,
         innerText: 0,
         snap: {
            innerText: 1
         },
         ease: "Expo.easeInOut"
      }, "<");

      tl.to(".presented-by .wrap > *", {
         duration: 0.6,
         ease: "Expo.easeIn",
         yPercent: -120,
         stagger: 0
      }, "< 1.4");

      tl.to(".loading-gosim", {
         duration: 0.6,
         ease: "Expo.easeIn",
         opacity: 0,
         yPercent: 25
      }, "<");

      tl.to(".logo-gosim-scroll svg", {
         duration: 1.2,
         ease: "Expo.easeOut",
         yPercent: 0,
      }, "< 0.6");

      tl.to(".logo-gosim-scroll svg", {
         duration: 2,
         ease: "Expo.easeInOut",
         scale: 1,
         clearProps: "all"
      }, "< 0.3");

      tl.to(".main-nav-bar", {
         duration: 2,
         ease: "Expo.easeInOut",
         opacity: 1
      }, "<");

      tl.to(".event-facts > *", {
         duration: 1.2,
         ease: "Expo.easeOut",
         y: "0em",
         stagger: 0.1,
         clearProps: "all"
      }, "< 0.8");

      tl.call(function() {
         resetScroll();
      }, null, 0.25);

      tl.call(function() {
         $('.modal-container .overlay-background-video').find('video').trigger('play');
         resetScroll();
      }, null, 0.5);

      tl.call(function() {
         pageTransitionOut();
      }, null, 2.5);

      tl.call(function() {
         gsap.set(".logo-gosim-scroll", {
            pointerEvents: "all"
         });
         scroll.start();
      }, null, 3.5);

      // Set overflow: unset after animations
	   tl.call(function() {
         document.querySelector('.main-nav-bar ul').style.overflow = 'unset';
       }, null, 3.5);
   } else {
      // Initial load steps if any
   }
}

// Animation - Page Loader
function initLoader(isInitialLoad = false) { 
   var tl = gsap.timeline();

   if (!isInitialLoad) {
      tl.set("html", { 
         cursor: "wait"
      });

      tl.set("html", { 
         cursor: "auto",
      });

      // Set overflow: hidden before animations
      tl.set(".main-nav-bar ul", {
         overflow: "hidden"
      });

      tl.set(".transition-screen", {
         opacity: 1,
         yPercent: 100,
         rotate: 0.001
      });

      tl.set(".transition-screen", {
         yPercent: 0,
      });

      tl.set(".transition-screen .shape-round.top", {
         scaleY: 0,
      });

      tl.set(".loading-container .wrap", {
         yPercent: 0,
         opacity: 1
      });

      if (document.querySelector('.fade-in-last')) {
         tl.set(".fade-in-last", {
            opacity: 0,
            y: "2em",
         });
      }

      tl.to(".loading-container .wrap", {
         duration: .6,
         yPercent: -120,
         ease: "Power4.easeIn",
         delay: 0.2
      });

      tl.to(".transition-screen", {
         duration: 1.2,
         yPercent: -100,
         ease: "Expo.easeInOut"
      }, "<");

      tl.to(".transition-screen .shape-round.top", {
         duration: 1.3,
         scaleY: 0,
         ease: "Expo.easeInOut",
      }, "<");

      tl.to(".transition-screen .shape-round.top", {
         duration: 0.6,
         scaleY: 1,
         ease: "Expo.easeIn",
      }, "<");

      tl.to(".transition-screen .shape-round.top", {
         duration: 0.6,
         scaleY: 0,
         ease: "Expo.easeOut",
      }, "< 0.6")

      tl.call(function() {
         $('.loading-container').addClass('loaded');
      }, null, 0);

      tl.call(function() {
         $('.modal-container .overlay-background-video').find('video').trigger('play');
      }, null, 0.5);

      // Set overflow: unset after animations
	   tl.call(function() {
         document.querySelector('.main-nav-bar ul').style.overflow = 'unset';
       });
   } else {
      // Initial load steps if any
   }
}

// Animation - Page Leave
function pageTransitionIn() {
   var tl = gsap.timeline();

   if(document.querySelector('.lorem-ipsum')) {}

   tl.set(".transition-screen", {
      opacity: 1,
      yPercent: 100,
      rotate: 0.001
   });

   tl.set(".loading-container .wrap", {
      yPercent: 120,
      opacity: 1,
   });

   tl.set(".transition-screen .shape-round.bottom", {
      scaleY: 0
   });

   tl.set(".transition-screen .shape-round.top", {
      scaleY: 0
   });
   
   tl.to(".transition-screen", {
      duration: .8,
      yPercent: 0,
      ease: "Power4.easeInOut",
   });

   tl.to(".transition-screen .shape-round.bottom", {
      duration: .4,
      scaleY: 1,
      ease: "Expo.easeIn",
   }, "<");

   tl.to(".transition-screen .shape-round.bottom", {
      duration: .4,
      scaleY: 0,
      ease: "Expo.easeOut",
   }, "< 0.4");

   tl.to(".loading-container .wrap", {
      duration: .6,
      yPercent: 0,
      ease: "Power4.easeOut",
   }, "<");

   tl.to(".loading-container .wrap", {
      duration: .6,
      yPercent: -120,
      ease: "Power4.easeIn",
   }, "< 0.5");

   tl.to(".transition-screen", {
      duration: 1.2,
      yPercent: -100,
      ease: "Expo.easeInOut"
   }, "<");

   tl.to(".transition-screen .shape-round.top", {
      duration: 0.6,
      scaleY: 1,
      ease: "Expo.easeIn",
   }, "<");

   tl.to(".transition-screen .shape-round.top", {
      duration: 0.6,
      scaleY: 0,
      ease: "Expo.easeOut",
   }, "< 0.7")   
}

// Animation - Page Enter
function pageTransitionOut() {
   var tl = gsap.timeline();

   if(document.querySelector('.section-home-header')) {
      tl.set(".logo-gosim-scroll, .event-facts", {
         opacity: 1
      });

      tl.set(".event-facts > *", {
         y: "2em"
      });

      tl.set(".logo-gosim-scroll svg", {
         yPercent: 120,
      });

      tl.set(".shape-round-home", { 
         scaleY: 0
      });
   }

   // Set overflow: hidden before animations
   tl.set(".main-nav-bar ul", {
      overflow: "hidden"
   });

   tl.set(".main-nav-bar nav li", {
      yPercent: 120,
   });

   if(document.querySelector('.fade-in-last')) {
      tl.set(".fade-in-last", {
         opacity: 0,
         y: "2em",
      });
   }

   tl.to(".main-nav-bar nav li", {
      duration: 1.2,
      yPercent: 0,
      stagger: 0.05,
      ease: "Expo.easeOut",
      delay: 0.8
   });

   // Set overflow: unset after animations
	tl.call(function() {
	   document.querySelector('.main-nav-bar ul').style.overflow = 'unset';
	});

   if(document.querySelector('.section-home-header')) {
      tl.to(".event-facts > *", {
         duration: 1.2,
         ease: "Expo.easeOut",
         y: "0em",
         stagger: 0.05,
         clearProps: "all"
      }, "<");

      tl.to(".logo-gosim-scroll svg", {
         duration: 1.2,
         ease: "Expo.easeOut",
         yPercent: 0,
         clearProps: "all"
      }, "<");

      tl.to(".shape-round-home", {
         duration: 1.2,
         ease: "Expo.easeOut",
         scaleY: 1
      }, "<");
   }

   if(document.querySelector('.fade-in-last')) {
      tl.to(".fade-in-last", {
         duration: 1.2,
         y: "0em",
         stagger: 0.05,
         ease: "Expo.easeOut",
         opacity: 1,
      }, "< 0.5");
   }
}

function resetScroll() {
   window.scrollTo(0, 0);
}

function initPageTransitions() {

   // Reset scroll on page next
   history.scrollRestoration = "manual";

   barba.hooks.afterEnter((data) => {
      // Ensure scroll is reset
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();

      // Find the anchor target based on the current URL hash
      const hash = window.location.hash;
      
      if (hash) {
         // Find the link that matches this hash
         const matchingLink = document.querySelector(`[data-anchor-target="${hash}"]`);
         
         if (matchingLink) {
            // Update page title if available
            const pageTitle = matchingLink.getAttribute('data-page-title') || 
                              matchingLink.textContent || 
                              document.title;
            
            // Update the page title in the loading animation
            const pageTitleElement = document.querySelector('[data-change-page-title]');
            if (pageTitleElement) {
               pageTitleElement.textContent = pageTitle;
            }

            // Scroll to the anchor
            setTimeout(() => {
               const navHeight = $(".main-nav-bar").innerHeight() * -1;
               
               // Use Lenis scroll method
               if (scroll && typeof scroll.scrollTo === 'function') {
                  scroll.scrollTo(hash, {
                     duration: 1,
                     offset: navHeight,
                     easing: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
                     onComplete: () => {
                        // Remove hash from URL
                        history.replaceState(
                           null, 
                           document.title, 
                           window.location.pathname + window.location.search
                        );
                     }
                  });
               } else {
                  // Fallback to default scrolling if Lenis is not available
                  const targetElement = document.querySelector(hash);
                  if (targetElement) {
                     targetElement.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                     });
                     
                     // Remove hash from URL
                     history.replaceState(
                        null, 
                        document.title, 
                        window.location.pathname + window.location.search
                     );
                  }
               }
            }, 300); // Small delay to ensure page is ready
         }
      }
   });
   
   barba.hooks.leave(() => {
      initBasicFunctions();
   });

   // Functions Before
   function initResetDataBefore() {
      // $('[data-navigation-status]').attr('data-navigation-status', 'not-active');
   }

   // Functions After
   function initResetDataAfter() {
      $('[data-navigation-status]').attr('data-navigation-status', 'not-active');
      $('[data-filter-status]').attr('data-filter-status', 'not-active');
      $('[data-nav-filter-status]').attr('data-nav-filter-status', 'not-active');
      $('[data-scrolling-direction]').attr('data-scrolling-direction', 'down');
      $('[data-scrolling-started]').attr('data-scrolling-started', 'false');
      $('[data-nav-filter-status]').attr('data-nav-filter-status', 'not-active');

      // Hide filter toggle
      $('[data-filter-toggle]').css({
         opacity: 0,
         visibility: 'hidden'
      });
   }

   barba.init({
      sync: true,
      debug: true,
      timeout: 7000,
      transitions: [{
         name: 'to-home',
         from: {},
         to: {
            namespace: ['home']
         },
         once(data) {
            initSmoothScroll(data.next.container);
            initScript();
            initLoaderHome(true); // Skip animations on initial load
         },
      },{
         name: 'self',
         async leave(data) {
            $('.loading-container').addClass('flex');
            pageTransitionIn(data.current);
            initResetDataBefore();
            await delay(transitionOffset);
            initBarbaNavUpdate(data);
            initResetDataAfter();
            scroll.destroy();
            data.current.container.remove();
         },
         async enter(data) {
            pageTransitionOut(data.next);
         },
         async beforeEnter(data) {
            // Ensure page title is reset before new page loads
            const pageTitleElement = document.querySelector('[data-change-page-title]');
            if (pageTitleElement) {
               pageTitleElement.textContent = data.next.container.getAttribute('data-page-title') || document.title;
            }
            
            ScrollTrigger.getAll().forEach(t => t.kill());
            initSmoothScroll(data.next.container);
            initScript(); 
         },
      },{
         name: 'default',
         once(data) {
            initSmoothScroll(data.next.container);
            initScript();
            initLoader(true); // Skip animations on initial load
         },
         async leave(data) {
            $('.loading-container').addClass('flex');
            pageTransitionIn(data.current);
            initChangePageTitle(data.next.container);
            initResetDataBefore();
            await delay(transitionOffset);
            initBarbaNavUpdate(data);
            initResetDataAfter();
            scroll.destroy();
            data.current.container.remove();
         },
         async enter(data) {
            pageTransitionOut(data.next);
         },
         async beforeEnter(data) {
            // Ensure page title is reset before new page loads
            const pageTitleElement = document.querySelector('[data-change-page-title]');
            if (pageTitleElement) {
               pageTitleElement.textContent = data.next.container.getAttribute('data-page-title') || document.title;
            }
            
            ScrollTrigger.getAll().forEach(t => t.kill());
            initSmoothScroll(data.next.container);
            initScript(); 
         },
      }]
   });

   function initChangePageTitle(container) {
      var nextPageTitle = $(container).attr('data-page-title');
      $(document).find('[data-change-page-title]').text(nextPageTitle);
   }

   function initSmoothScroll(container) {
      // Lenis: https://github.com/studio-freight/lenis
      initLenis();
      ScrollTrigger.refresh();
   }  
}

function initLenis() {
   scroll = new Lenis({
      duration: 1
   });

   scroll.on('scroll', ScrollTrigger.update);

   gsap.ticker.add((time)=>{
      scroll.raf(time * 1000);
   });
   
   gsap.ticker.lagSmoothing(0);
}

// Don't touch
function delay(n) {
   n = n || 2000;
   return new Promise((done) => {
      setTimeout(() => {
         done();
      }, n);
   });
}

/**
 * Fire all scripts on page load
 */
function initScript() {
   initFlickitySlider();
   initCheckWindowHeight();
   initBasicFunctions();
   // initScrollTriggerPlayVideoInview();
   initCheckScrollUpDown();
   initScrollToAnchor();
   initScrollTriggerDataBackground();
   /* initScrollTriggerParallaxScroll(); */
   initScrolltriggerAnimations();
}

/**
 * Barba Update Links outside Main on page Transition
 */
function initBarbaNavUpdate(data) {
   const updateItems = $(data.next.html).find('[data-barba-update]');
   $('[data-barba-update]').each(function(index) {
      if($(updateItems[index]).get(0)) {
         const newLinkStatus = $(updateItems[index]).get(0).getAttribute('data-link-status');
         $(this).attr('data-link-status', newLinkStatus);
      }
   });
}

/**
 * Window Inner Height Check
 */
function initCheckWindowHeight() {
   // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
   let vh = window.innerHeight * 0.01;
   document.documentElement.style.setProperty('--vh', `${vh}px`);
}

/**
 * Basic Functions
 */
function initBasicFunctions() {
   // Toggle Navigation
   $('[data-navigation-toggle="toggle"]').click(function(){
      if ($('[data-navigation-status]').attr('data-navigation-status') == 'not-active') {
         $('[data-navigation-status]').attr('data-navigation-status', 'active');
      } else {
         $('[data-navigation-status]').attr('data-navigation-status', 'not-active');
      }
   });
   
   // Close Navigation
   $('[data-navigation-toggle="close"]').click(function(){
      $('[data-navigation-status]').attr('data-navigation-status', 'not-active');
   });

   // Key ESC - Close Navigation
   $(document).keydown(function(e){
      if(e.keyCode == 27) {
         if ($('[data-navigation-status]').attr('data-navigation-status') == 'active') {
            $('[data-navigation-status]').attr('data-navigation-status', 'not-active');
         } 
      }
   });

   // Toggle Filter
   $('[data-filter-toggle="toggle"]').click(function(){
      if ($('[data-nav-filter-status]').attr('data-nav-filter-status') == 'not-active') {
         $('[data-nav-filter-status]').attr('data-nav-filter-status', 'active');
      } else {
         $('[data-nav-filter-status]').attr('data-nav-filter-status', 'not-active');
      }
   });
   
   // Close Filter
   $('[data-filter-toggle="close"]').click(function(){
      $('[data-nav-filter-status]').attr('data-nav-filter-status', 'not-active');
   });

   // Hover Btn
   $('.btn-hover').on('mouseenter', function() {
      if ($(this).find('.btn-click').hasClass('active')) {
         // Nothing
      } else {
         $(this).find('.btn-click').removeClass("transitioning").addClass("hover");
      }
   });
   $('.btn-hover').on('mouseleave', function() {
      if ($(this).find('.btn-click').hasClass('active')) {
         // Nothing
      } else {
         $(this).find('.btn-click').addClass("transitioning").removeClass("hover").delay(450).queue(function(next){
            $(this).removeClass("transitioning");
         next();
         });
      }
   });

   // Audience Reasons Toggle
   $(".section-home-why").each(function () {
      var sectionHomeWhy = $(this);
      sectionHomeWhy.find('[data-audience-toggle]').click(function(){
         var audienceName = $(this).attr('data-audience-name');
         if ($(this).attr('data-audience-status') == 'not-active') {
            sectionHomeWhy.find('[data-audience-name="' + audienceName + '"]').attr('data-audience-status', 'active').siblings().attr('data-audience-status', 'not-active');
         }
      });
   });

   // Filter
   $('[data-filter-section]').each(function () {

      var filterSection = $(this);
      var filterGroup = $('[data-filter-group]');
      var filterGrid = $('[data-filter-grid]');

      filterGroup.find('[data-filter-category]').click(function(){
         var clickedFilter = $(this);
         var clickedFilterCategory = $(this).data('filter-category');
         if (clickedFilter.attr('data-filter-status') == 'active') {
         // If active > Do nothing
         }
         // All Filter
         else if (clickedFilterCategory == 'all') {
            $('[data-nav-filter-status]').attr('data-nav-filter-status', 'not-active');
            filterGrid.addClass('toggle-fade-out');
            filterGroup.find('[data-filter-category="' + clickedFilterCategory + '"]').attr('data-filter-status', 'active').siblings().attr('data-filter-status', 'not-active');
            setTimeout(function() {
               filterGrid.find('[data-filter-category]').attr('data-filter-status', 'active');
               filterGrid.removeClass('toggle-fade-out').addClass('toggle-fade-in');
               filterCheckEvenOdd();
               scroll.destroy();
               initLenis();
               initCheckScrollUpDown();
               ScrollTrigger.refresh();
            }, 200);
            setTimeout(function() {
               filterGrid.removeClass('toggle-fade-in');
            }, 400);
         } 
         // Category Filters
         else {
            $('[data-nav-filter-status]').attr('data-nav-filter-status', 'not-active');
            filterGrid.addClass('toggle-fade-out');
            filterGroup.find('[data-filter-category="' + clickedFilterCategory + '"]').attr('data-filter-status', 'active').siblings().attr('data-filter-status', 'not-active');
            setTimeout(function() {
               filterGrid.find('[data-filter-category]').attr('data-filter-status', 'not-active');
               filterGrid.find('[data-filter-category="' + clickedFilterCategory + '"]').attr('data-filter-status', 'active');
               filterGrid.removeClass('toggle-fade-out').addClass('toggle-fade-in');
               filterCheckEvenOdd();
               scroll.destroy();
               initLenis();
               initCheckScrollUpDown();
               ScrollTrigger.refresh();
            }, 200);
            setTimeout(function() {
               filterGrid.removeClass('toggle-fade-in');
            }, 400);
         }
      });

      function filterCheckEvenOdd() {
         filterGrid.find('[data-filter-status="active"]').each(function (index) {
            if(index % 2 == 0) {
               $(this).attr('data-filter-index-even', 'true');
            } else {
               $(this).attr('data-filter-index-even', 'false');
            }
         });
      }
   });

   // Modal Cards
   var modalCards = $('[data-modal-grid]');

   modalCards.find('[data-modal-card-id]').click(function(){
      var clickedCard = $(this);
      var clickedCardId = $(this).data('modal-card-id');
      if (clickedCard.attr('data-modal-card-status') == 'active') {
      // If active > Do nothing
      } else {
         $('[data-modal-status]').attr('data-modal-status', 'active');
         $('[data-modal-card-id]').attr('data-modal-card-status', 'not-active');
         $('[data-modal-card-id="' + clickedCardId + '"]').attr('data-modal-card-status', 'active')
      }
   });

   // Prelaunch Modal
   $('[data-prelaunch-modal="toggle"]').click(function(){
      $('[data-modal-prelaunch-status]').attr('data-modal-prelaunch-status', 'active');
      $('[data-modal-card-id]').attr('data-modal-card-status', 'not-active');
      $('[data-modal-card-id="prelaunch"]').attr('data-modal-card-status', 'active')
   });

   // Tickets Modal
   $('[data-tickets-modal="toggle"]').click(function(){
      $('[data-modal-tickets-status]').attr('data-modal-tickets-status', 'active');
      $('[data-modal-card-id]').attr('data-modal-card-status', 'not-active');
      $('[data-modal-card-id="tickets"]').attr('data-modal-card-status', 'active')
      //Send an event (Add to cart) to the DataLayer
      dataLayer.push({'event': 'add_to_cart'});
   });

   // Close Modal
   $('[data-modal-toggle="close"]').click(function(){
      $('[data-modal-status]').attr('data-modal-status', 'not-active');
      $('[data-modal-prelaunch-status]').attr('data-modal-prelaunch-status', 'not-active');
      $('[data-modal-tickets-status]').attr('data-modal-tickets-status', 'not-active');
      $('[data-modal-card-id]').attr('data-modal-card-status', 'not-active');
   });

   $('[data-scroll-prevent]').mouseover(function(){
      scroll.stop();
   });

   $('[data-scroll-prevent]').mouseout(function(){
      scroll.start();
   });

   // Accordion
   $('[data-accordion-toggle]').click(function(){
      if ($(this).parent().attr('data-accordion-status') == 'active') {
         $(this).parent().attr('data-accordion-status', 'not-active').siblings().attr('data-accordion-status', 'not-active');
      }
      else {
         $(this).parent().siblings().attr('data-accordion-status', 'not-active');
         $(this).parent().attr('data-accordion-status', 'active');
      }
      setTimeout(function() {
         scroll.destroy();
         initLenis();
         initCheckScrollUpDown();
         ScrollTrigger.refresh();
      }, 300);
   });

   // Jury Toggle
   $('[data-jury-id]').on('click mouseover', function() {
      if ($(this).attr('data-jury-status') == 'not-active') {
         $(this).attr('data-jury-status', 'active').siblings().attr('data-jury-status', 'not-active');
      }
   });

   // Toggle Navigation
   $('[data-ticket-toggle="toggle"]').click(function(){
      if ($('[data-ticket-status]').attr('data-ticket-status') == 'not-active') {
         $('[data-ticket-status]').attr('data-ticket-status', 'active');
      } else {
         $('[data-ticket-status]').attr('data-ticket-status', 'not-active');
      }
   });
   
   // Close Navigation
   $('[data-ticket-toggle="close"]').click(function(){
      $('[data-ticket-status]').attr('data-ticket-status', 'not-active');
   });
}

/**
 * Play Video Inview
 */
/* function initScrollTriggerPlayVideoInview() {

   let allVideoDivs = gsap.utils.toArray('.playpause');

   allVideoDivs.forEach((videoDiv, i) => {

      let videoElem = videoDiv.querySelector('video')

      ScrollTrigger.create({
         trigger: videoElem,
         start: '0% 120%',
         end: '100% -20%',
         onEnter: () => videoElem.play(),
         onEnterBack: () => videoElem.play(),
         onLeave: () => videoElem.pause(),
         onLeaveBack: () => videoElem.pause(),
      });
   });
} */

/**
 * Lenis - Check Scroll up or Down
 */

function initCheckScrollUpDown() {

   var lastScrollTop = 0
   var threshold = 50;
   var thresholdTop = 50;

   function startCheckScroll() {
      scroll.on('scroll', (e) => {
         var nowScrollTop = e.targetScroll;

         if (Math.abs(lastScrollTop - nowScrollTop) >= threshold) {
            
            // Check Scroll Direction
            if (nowScrollTop > lastScrollTop) {
               $("[data-scrolling-direction]").attr('data-scrolling-direction', 'down');
            } else {
               $("[data-scrolling-direction]").attr('data-scrolling-direction', 'up');
            }
            lastScrollTop = nowScrollTop;

            // Check if Scroll Started
            if (nowScrollTop > thresholdTop) {
               $("[data-scrolling-started]").attr('data-scrolling-started', 'true');
            } else {
               $("[data-scrolling-started]").attr('data-scrolling-started', 'false');
            }
         }
      });
   }
   startCheckScroll();

   // Reset instance
   barba.hooks.after(() => {
      startCheckScroll();
   });
}

/**
 * Lenis - ScrollTo Anchor Links
 */
function initScrollToAnchor() {
   var scrollToOffset = ($(".main-nav-bar").innerHeight() * -1);
   
   $("[data-anchor-target]").click(function(e) {
      let targetScrollToAnchorLenis = $(this).attr('data-anchor-target');
      
      // Update page title
      const pageTitle = $(this).attr('data-page-title') || $(this).text();
      $('[data-change-page-title]').text(pageTitle);
      
      // Scroll to anchor
      scroll.scrollTo(targetScrollToAnchorLenis, {
         duration: 1,
         offset: scrollToOffset,
         easing: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
      });
   });

   $(".filter-container [data-filter-category]").click(function() {
      setTimeout(function() {
         scroll.scrollTo("#grid", {
            immediate: true,
            offset: scrollToOffset,
         });
      }, 200);
   });
}

/**
 * Scrolltrigger - Check Theme of Sections
 */
 function initScrollTriggerDataBackground() {

   // Calculate offset navigation
   const navHeight = $(".main-nav-bar").innerHeight();

   // Check Theme (Dark/Light)
   $('[data-theme-section]').each(function(){

      var themeName = $(this).attr('data-theme-section');
      var singleSection = gsap.utils.toArray('[data-theme-section="' + themeName +  '"]');

      singleSection.forEach(singleSection => {
         ScrollTrigger.create({
            trigger: singleSection,
            start: () => "0% " + navHeight,
            end: "100% " + navHeight,
            onEnter: () => functionAddTheme(),
            onEnterBack: () => functionAddTheme(),
            markers: false,
         });
         function functionAddTheme() {
            if ($('[data-theme-nav]').attr('data-theme-nav') == themeName) {
            } else {
               $('[data-theme-nav]').attr('data-theme-nav', themeName);
            }
         };
      });
   });

   // Check Background Color
   $('[data-bg-section]').each(function(){

      var bgColorName = $(this).attr('data-bg-section');
      var singleBgColor = gsap.utils.toArray('[data-bg-section="' + bgColorName +  '"]');

      singleBgColor.forEach(singleBgColor => {
         ScrollTrigger.create({
            trigger: singleBgColor,
            start: () => "0% " + navHeight,
            end: "100% " + navHeight,
            onEnter: () => functionAddTheme(),
            onEnterBack: () => functionAddTheme(),
            markers: false,
         });
         function functionAddTheme() {
            if ($('[data-bg-nav]').attr('data-bg-nav') == bgColorName) {
            } else {
               $('[data-bg-nav]').attr('data-bg-nav', bgColorName);
            }
         };
      });
   });
}

/**
* Flickity Slider
*/
function initFlickitySlider() {

   // Source
   // https://flickity.metafizzy.co/

   // Slider type: Cards

   $('[data-flickity-slider-type="cards"]').each(function (index) {

      var sliderIndexID = 'flickity-slider-type-cards-id-' + index;
      $(this).attr('id', sliderIndexID);

      var sliderThis = $(this);

      var flickitySliderGroup = document.querySelector('#' + sliderIndexID + ' .flickity-carousel');
      var flickitySlider = sliderThis.find('.flickity-carousel').flickity({
         // options
         watchCSS: true,
         contain: true,
         wrapAround: false,
         dragThreshold: 10,
         prevNextButtons: false,
         pageDots: false,
         cellAlign: 'left',
         selectedAttraction: 0.015,
         friction: 0.25,
         percentPosition: true,
         freeScroll: false,
         on: {
            'dragStart': () => {
               flickitySlider.css("pointer-events", "none");
            },
            'dragEnd': () => {
               flickitySlider.css("pointer-events", "auto");
            },
            change: function () {
               updatePagination();
            }
         }
      });

      // Flickity instance
      var flkty = flickitySlider.data('flickity');

      // previous
      var prevButton = sliderThis.find('[data-flickity-control="prev"]').on('click', function () {
         flickitySlider.flickity('previous');
      });
      // next
      var nextButton = sliderThis.find('[data-flickity-control="next"]').on('click', function () {
         flickitySlider.flickity('next');
      });
      // Get the amount of columns variable and use to calc last slide
      var inviewColumns = window.getComputedStyle(flickitySliderGroup).getPropertyValue('--columns');

      function updatePagination() {
         // enable/disable previous/next buttons
         if (!flkty.cells[flkty.selectedIndex - 1]) {
            prevButton.attr('disabled', 'disabled');
            nextButton.removeAttr('disabled'); // <-- remove disabled from the next
         } else if (!flkty.cells[flkty.selectedIndex + parseInt(inviewColumns)]) {
            nextButton.attr('disabled', 'disabled');
            prevButton.removeAttr('disabled'); //<-- remove disabled from the prev
         } else {
            prevButton.removeAttr('disabled');
            nextButton.removeAttr('disabled');
         }
      }
   });
}




/**
* GSAP Scrolltrigger Parallax Scroll
*/
function initScrollTriggerParallaxScroll() {

   ScrollTrigger.matchMedia({
      "(min-width: 1025px)": function() {

         if(document.querySelector('[data-parallax-strength]')) {
            $('[data-parallax-strength]').each(function () {
               
               let tl;
               let triggerElement = $(this);
               let targetElement = $(this).find('[data-parallax-target]');
               let triggerElementID = $(this).attr('data-parallax-trigger');
               let targetElementParallax = ($(this).attr('data-parallax-strength') * 20);
               let heightElementParallax = ($(this).attr('data-parallax-height') * 20);
               $(this).css("--parallax-strength", " " + targetElementParallax + "%");
               $(this).css("--parallax-height", " " + heightElementParallax + "%");

               
               // Check if [data-parallax-trigger="#header"] exists
               if ($(triggerElementID).length !== 0) {
                  triggerElement = $(document).find(triggerElementID);
               }
               
               tl = gsap.timeline({
                  scrollTrigger: {
                     trigger: triggerElement,
                     start: "0% 100%",
                     end: "100% 0%",
                     scrub: true,
                     markers: false
                  }
               });

               tl.set(targetElement, {
                  rotate: 0.001,
               });

               // if ($(this).attr('data-parallax-position') == 'top') {}

               tl.fromTo(targetElement, {
                  yPercent: (targetElementParallax * -0.5)
               }, {
                  yPercent: (targetElementParallax * 0.5),
                  ease: "none"
               });

            });
         }
      }
   });

   
}

/**
* Scrolltrigger Animations Desktop + Mobile
*/
function initScrolltriggerAnimations() {

   if(document.querySelector('[data-filter-grid]')) {
      $('[data-filter-grid]').each(function () {
         let triggerElement = $(this);
         let targetElement = $('.filter-alpha-animate');
      
         let tl = gsap.timeline({
            scrollTrigger: {
               trigger: triggerElement,
               start: "0% 0%",
               end: "100% 0%",
               toggleActions: 'play reverse play reset',
               onLeave: () => $('[data-nav-filter-status]').attr('data-nav-filter-status', 'not-active'),
               onLeaveBack: () => $('[data-nav-filter-status]').attr('data-nav-filter-status', 'not-active'),
            }
         });
         
         tl.to(targetElement, {
            autoAlpha: 1,
            duration: 0.3,
            ease: "Power1.easeInOut"
         });
      });
   } 

   if(document.querySelector(".section-stats")) {
      $(".section-stats").each(function (index) {
        let triggerElement = $(this);
        let targetElement = $(this).find(".count-up");
      
         let tl = gsap.timeline({
            scrollTrigger: {
               trigger: triggerElement,
               start: "0% 70%",
               end: "100% 0%"
            }
         });
         tl.from(targetElement, {
            duration: 2.5,
            ease: Expo.easeOut,
            innerText: 0,
            roundProps: "innerText",
            stagger: 0,
            onUpdate: function() {
               this.targets().forEach(target => {
                  const val = gsap.getProperty(target, "innerText");
                  target.innerText = numberWithCommas(val);
               });
            },
         }, "<");

         function numberWithCommas(n) {
            var parts=n.toString().split(".");
            return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
         }
      });
   }

   ScrollTrigger.matchMedia({
      "(min-width: 1025px)": function() {


         if(document.querySelector('.animate-read')) {
            // Scrolltrigger Animation : Example
            $('.animate-read').each(function (index) {
               let triggerElement = $(this);
               let targetElement = $(this).find('.single-word');
            
               let tl = gsap.timeline({
                  scrollTrigger: {
                     trigger: triggerElement,
                     start: "0% 95%",
                     end: "100% 55%",
                     scrub: 1
                  }
               });
      
               tl.fromTo(targetElement, {
                  opacity: 0.1,
               },{
                  duration: 0.1,
                  opacity: 1,
                  stagger: 0.01,
                  ease: "none"
               });
            });
         }  

       /*  if(document.querySelector('.section-brands')) {
            $('.section-brands').each(function () {
               let triggerElement = $(this);
               let targetElement = $(this).find('.reveal-box');
            
               let tl = gsap.timeline({
                  scrollTrigger: {
                     trigger: triggerElement,
                     start: "25% 50%",
                     end: "100% 0%",
                     toggleActions: 'play none none none',
                     markers: false
                  }
               });
               
               tl.fromTo(targetElement, {
                  scale: 0,
                  rotate: 0.001,
               }, {
                  scale: 1,
                  rotate: 0.001,
                  stagger: {
                     amount: 0.5,
                     from: "random",
                  },
                  duration: 3,
                  ease: "Expo.easeOut",
               });

               tl.from(targetElement, {
                  left: "50%",
                  top: "50%",
                  duration: 3,
                  ease: "Expo.easeOut",
               }, "<");
            });
         }*/

      }
   });
}