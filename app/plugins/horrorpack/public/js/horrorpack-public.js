(function($) {
    'use strict';

    /**
     * All of the code for your public-facing JavaScript source
     * should reside in this file.
     *
     * Note: It has been assumed you will write jQuery code here, so the
     * $ function reference has been prepared for usage within the scope
     * of this function.
     *
     * This enables you to define handlers, for when the DOM is ready:
     *
     * $(function() {
     *
     * });
     *
     * When the window is loaded:
     *
     * $( window ).load(function() {
     *
     * });
     *
     * ...and/or other possibilities.
     *
     * Ideally, it is not considered best practise to attach more than a
     * single DOM-ready or window-load handler for a particular page.
     * Although scripts in the WordPress core, Plugins and Themes may be
     * practising this, we should strive to set a better example in our own work.
     */

    var initSendyForm = function() {
        $(".hp-sendy-form").on('submit', function(e) {

            e.preventDefault();

            var $form = $(this);
            var $terms = $form.find('input[name="terms"]')
            var name = $form.find('input[name="name"]').val();
            var email = $form.find('input[name="email"]').val();
            var dante = $form.find('input[name="dante"]').val();

            if (dante.length > 0) {
                return;
            }

            var $sendyResponses = $('.hp-sendy-form__responses .response');
            $sendyResponses.hide().empty();

            if (email.length === 0 || !validateEmail(email)) {
                $sendyResponses.filter('.response--error')
                    .text(horrorpack.i18n.invalidEmail)
                    .show();

                return
            }

            if ($terms.length > 0 && !$terms.is(':checked')) {
                $sendyResponses.filter('.response--error')
                    .text(horrorpack.i18n.mustAcceptTerms)
                    .show();

                return
            }

            $.ajax({
                url: horrorpack.ajaxURL,
                data: {
                    action: 'hpfda',
                    fn: 'newsletter_subscribe',
                    name: name,
                    email: email
                },
                success: function(data) {

                    if (data) {
                        switch (data) {
                            case '"Some fields are missing."':
                                $sendyResponses.filter('.response--error')
                                    .text("Please fill in all the fields.")
                                    .show();
                                break;
                            case '"Invalid email address."':
                                $sendyResponses.filter('.response--error')
                                    .text("Invalid email.")
                                    .show();
                                break;
                            case '"Invalid list ID."':
                                $sendyResponses.filter('.response--error')
                                    .text("Sorry, we couldn't subscribe you at this time.")
                                    .show();
                                break;
                            case '"Already subscribed."':
                                $sendyResponses.filter('.response--error')
                                    .text("Already subscribed.")
                                    .show();
                                break;
                            case '"1"':
                                $sendyResponses.filter('.response--success')
                                    .text("Subscription successful!")
                                    .show();

                                $form.trigger('hp/newsletterSuccess')

                                // Empty the fields on successful registration
                                $form.find('input[type="email"], input[type="text"]').blur().val('');
                                $terms.prop('checked', false);
                                break;
                        }
                    } else {
                        alert("Sorry, we couldn't subscribe you at this time.");
                    }
                }
            });
        });
    };

    var initMailchimpForm = function() {
        $(".mailchimp-form").on('submit', function(e) {

            e.preventDefault();

            var $form = $(this);
            var $terms = $form.find('input[name="terms"]')
            var name = $form.find('input[name="name"]').val();
            var email = $form.find('input[name="email"]').val();
            var dante = $form.find('input[name="dante"]').val();

            if (dante.length > 0) {
                return;
            }

            var $mailchimpResponses = $form.find('.mailchimp-form__responses .response');
            $mailchimpResponses.hide().empty();

            if (email.length === 0 || !validateEmail(email)) {
                $mailchimpResponses.filter('.response--error')
                    .text(horrorpack.i18n.invalidEmail)
                    .show();

                return
            }

            if ($terms.length > 0 && !$terms.is(':checked')) {
                $mailchimpResponses.filter('.response--error')
                    .text(horrorpack.i18n.mustAcceptTerms)
                    .show();

                return
            }


            $.ajax({
                url: horrorpack.ajaxURL,
                data: {
                    action: 'hpfda',
                    fn: 'submit_subscriber',
                    email: email
                },
                success: function(data) {
                    data = JSON.parse(data);
                    if (!data || !data.hasOwnProperty('body') || !JSON.parse(data.body).hasOwnProperty('status')) {
                        alert("Sorry, we couldn't subscribe you at this time.");
                        return;
                    }
                    var response = JSON.parse(data.body);

                    switch (response.status) {
                        case 400:
                            switch (response.detail) {
                                case 'Blank email address':
                                    $mailchimpResponses.filter('.response--error')
                                        .text(horrorpack.i18n.blankEmail)
                                        .show();
                                    break;
                                case 'Please provide a valid email address.':
                                    $mailchimpResponses.filter('.response--error')
                                        .text(horrorpack.i18n.invalidEmail)
                                        .show();
                                    break;
                                default:
                                    if (response.title === 'Member Exists') {
                                        $mailchimpResponses.filter('.response--error')
                                            .text(horrorpack.i18n.alreadySubscribed)
                                            .show();
                                    } else {
                                        $mailchimpResponses.filter('.response--error')
                                            .text(horrorpack.i18n.invalidEmail)
                                            .show();
                                    }
                                    break;
                            }
                            break;
                        case 'pending':
                            $mailchimpResponses.filter('.response--success')
                                .text(horrorpack.i18n.subscriptionSuccessful)
                                .show();

                            $form.trigger('hp/newsletterSuccess')

                            // Empty the fields on successful registration
                            $form.find('input[type="email"], input[type="text"]').blur().val('');
                            $terms.prop('checked', false);
                            break;
                    }
                }
            });
        });
    };

    var initAutopilotForm = function() {
        $(".autopilot-form").on('submit', function(e) {

            e.preventDefault();

            var $form = $(this);
            var $terms = $form.find('input[name="terms"]')
            var email = $form.find('input[name="email"]').val();
            var dante = $form.find('input[name="dante"]').val();

            if (dante.length > 0) {
                return;
            }

            var $autopilotResponses = $form.find('.autopilot-form__responses .response');
            $autopilotResponses.hide().empty();

            if (email.length === 0 || !validateEmail(email)) {
                $autopilotResponses.filter('.response--error')
                    .text(horrorpack.i18n.invalidEmail)
                    .show();

                return
            }

            if ($terms.length > 0 && !$terms.is(':checked')) {
                $autopilotResponses.filter('.response--error')
                    .text(horrorpack.i18n.mustAcceptTerms)
                    .show();

                return
            }

            var sessionId = typeof AutopilotAnywhere !== 'undefined' && AutopilotAnywhere.hasOwnProperty('sessionId') ? AutopilotAnywhere.sessionId : '';

            $.ajax({
                url: horrorpack.ajaxURL,
                data: {
                    action: 'hpfda',
                    fn: 'submit_subscriber_to_autopilot',
                    email: email,
                    sessionId: sessionId,
                    source: window.location.href
                },
                success: function(data) {
                    data = JSON.parse(data);
                    if (!data || !data.hasOwnProperty('body') || !JSON.parse(data.body).hasOwnProperty('contact_id')) {
                        alert("Sorry, we couldn't subscribe you at this time.");
                        return;
                    }

                    $autopilotResponses.filter('.response--success')
                        .text(horrorpack.i18n.subscriptionSuccessful)
                        .show();

                    $form.trigger('hp/newsletterSuccess')

                    // Empty the fields on successful registration
                    $form.find('input[type="email"], input[type="text"]').blur().val('');
                    $terms.prop('checked', false);
                }
            });
        });
    };

    var initKlaviyoForm = function() {
        $(".klaviyo-form").on('submit', function(e) {

            e.preventDefault();

            var $form = $(this);
            var $terms = $form.find('input[name="terms"]')
            var email = $form.find('input[name="email"]').val();
            var listID = $form.find('input[name="list_id"]').val();
            var tag = $form.find('input[name="tag"]').val();
            var dante = $form.find('input[name="dante"]').val();

            if (dante.length > 0) {
                return;
            }

            var $klaviyoResponses = $form.find('.klaviyo-form__responses .response');
            $klaviyoResponses.hide().empty();

            if (email.length === 0 || !validateEmail(email)) {
                $klaviyoResponses.filter('.response--error')
                    .text(horrorpack.i18n.invalidEmail)
                    .show();

                return
            }

            if ($terms.length > 0 && !$terms.is(':checked')) {
                $klaviyoResponses.filter('.response--error')
                    .text(horrorpack.i18n.mustAcceptTerms)
                    .show();

                return
            }

            $.ajax({
                url: horrorpack.ajaxURL,
                data: {
                    action: 'hpfda',
                    fn: 'submit_subscriber_to_klaviyo',
                    email: email,
                    list_id: listID,
                    tag: tag
                },
                success: function(data) {
                    data = JSON.parse(data);
                    if (data.hasOwnProperty('error') && data.error === true) {
                        switch (data.detail) {
                            case 'Already Subscribed':
                                $klaviyoResponses.filter('.response--error')
                                    .text(horrorpack.i18n.alreadySubscribed)
                                    .show();
                                break;
                            case 'Invalid Email':
                                $klaviyoResponses.filter('.response--error')
                                    .text(horrorpack.i18n.invalidEmail)
                                    .show();
                                break;

                            default:
                                break;
                        }

                        return
                    }

                    $klaviyoResponses.filter('.response--success')
                        .text(horrorpack.i18n.subscriptionSuccessful)
                        .show();

                    $form.trigger('hp/newsletterSuccess')

                    // Empty the fields on successful registration
                    $form.find('input[type="email"], input[type="text"]').blur().val('');
                    $terms.prop('checked', false);
                }
            });
        });
    };

    // Cookie Notice
    var cookieNotice = function() {

        if ($.cookie('hpCookieConsent') !== 'true') {
            setTimeout(function() {
                $('.hp-cookie-notice').addClass('hp-cookie-notice--visible');

                $('#dismiss-cookie-notice').on('click', function(event) {
                    event.preventDefault();
                    $('.hp-cookie-notice').removeClass('hp-cookie-notice--visible');
                    $.cookie('hpCookieConsent', 'true', {
                        expires: parseInt(horrorpack.rememberConsent),
                        path: '/'
                    });
                });
            }, horrorpack.cookieNoticeDelay);
        }

    };

    if (typeof $.cookie === 'undefined') {
        $.getScript("https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js", function(data, textStatus, jqxhr) {
            var cookieInterval = setInterval(function() {
                if (typeof $.cookie === 'undefined') {
                    return;
                }

                clearInterval(cookieInterval);
                cookieNotice();
            }, 100)
        });
    } else {
        cookieNotice();
    }

    var validateEmail = function(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    var init = function() {
        initSendyForm();
        initMailchimpForm();
        initAutopilotForm();
        initKlaviyoForm();
    };

    // Initialize.
    $(document).on('loadedPageAsync', init); // Useful for websites that loaded content asyncronously.
    $(document).ready(init);

})(jQuery);