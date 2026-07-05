(function () {
    'use strict';

    var VALID_LEVELS = new Set(['secondary', 'primary']);
    var VALID_SYLLABUSES = new Set(['spm', 'uec', 'igcse', 'sg', 'kssr']);
    var SYLLABUS_LEVELS = {
        spm: 'secondary',
        uec: 'secondary',
        igcse: 'secondary',
        sg: 'secondary',
        kssr: 'primary'
    };
    var ROUTE_PREFIX = '#/';

    function normalizeHash(hash) {
        var value = String(hash || '').trim();
        var hashIndex = value.indexOf('#/');
        return hashIndex >= 0 ? value.slice(hashIndex) : value;
    }

    function parseRouteHash(hash) {
        var normalized = normalizeHash(hash);
        if (!normalized.startsWith(ROUTE_PREFIX)) {
            return { valid: false, level: null, syllabus: null, layer: null };
        }

        var parts = normalized.slice(2).split('/').filter(Boolean);
        var level = parts[0];
        var syllabus = parts[1];
        var layer = parts[2];

        if (
            parts.length !== 3 ||
            !VALID_LEVELS.has(level) ||
            !VALID_SYLLABUSES.has(syllabus) ||
            SYLLABUS_LEVELS[syllabus] !== level
        ) {
            return { valid: false, level: null, syllabus: null, layer: null };
        }

        return {
            valid: true,
            level: level,
            syllabus: syllabus,
            layer: layer || (syllabus + '-subjects')
        };
    }

    function formatRoute(level, syllabus, layer) {
        return '#/' + level + '/' + syllabus + '/' + (layer || (syllabus + '-subjects'));
    }

    function isRootRouteHash(hash) {
        return parseRouteHash(hash).valid;
    }

    function withSourceContext(href, routeHash) {
        var value = String(href || '');
        var hashIndex = value.indexOf('#');
        var base = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
        var hash = hashIndex >= 0 ? value.slice(hashIndex + 1) : '';
        var separator = base.indexOf('?') >= 0 ? '&' : '?';
        return base + separator + 'from=' + encodeURIComponent(routeHash) + (hash ? '#' + hash : '');
    }

    function stripSitePrefix(pathname) {
        return String(pathname || '')
            .replace(/^\/interactive-course\//, '')
            .replace(/^\//, '');
    }

    function getRelativeRootPrefix(pathname) {
        var relativePath = stripSitePrefix(pathname);
        var parts = relativePath.split('/').filter(Boolean);
        var folderDepth = Math.max(parts.length - 1, 0);
        return '../'.repeat(folderDepth);
    }

    function buildUniversityFallback(pathname) {
        var relativePath = stripSitePrefix(pathname);
        var parts = relativePath.split('/');
        var universityIndex = parts.indexOf('University');
        var faculty = parts[universityIndex + 1] || '';
        var facultyKey = faculty.toLowerCase();

        if (!facultyKey || facultyKey.indexOf('.') >= 0) {
            return 'index.html';
        }

        var foldersAfterFaculty = Math.max(parts.length - universityIndex - 3, 0);
        var prefixToUniversity = '../'.repeat(foldersAfterFaculty + 1);

        return prefixToUniversity + facultyKey + '-hub.html';
    }

    function getSearchParam(search, key) {
        var params = new URLSearchParams(String(search || '').replace(/^\?/, ''));
        return params.get(key);
    }

    function buildReturnUrl(options) {
        var pathname = options && options.pathname ? options.pathname : window.location.pathname;
        var search = options && options.search ? options.search : window.location.search;
        var from = getSearchParam(search, 'from');
        var rootPrefix = getRelativeRootPrefix(pathname);

        if (from && isRootRouteHash(from)) {
            return rootPrefix + 'index.html' + from;
        }

        if (stripSitePrefix(pathname).indexOf('content/University/') === 0) {
            return buildUniversityFallback(pathname);
        }

        return rootPrefix + 'index.html';
    }

    function getDefaultLevelForSyllabus(syllabus) {
        return syllabus === 'kssr' ? 'primary' : 'secondary';
    }

    function setActiveButton(container, selector, predicate) {
        if (!container) return;
        container.querySelectorAll(selector).forEach(function (button) {
            button.classList.toggle('active', predicate(button));
        });
    }

    function setLevel(level) {
        var secondaryTabs = document.getElementById('secondary-tabs');
        var primaryTabs = document.getElementById('primary-tabs');
        var secondaryButton = document.getElementById('btn-level-secondary');
        var primaryButton = document.getElementById('btn-level-primary');

        if (secondaryTabs) secondaryTabs.style.display = level === 'secondary' ? 'flex' : 'none';
        if (primaryTabs) primaryTabs.style.display = level === 'primary' ? 'flex' : 'none';
        if (secondaryButton) secondaryButton.classList.toggle('active', level === 'secondary');
        if (primaryButton) primaryButton.classList.toggle('active', level === 'primary');
    }

    function activateSyllabusTab(level, syllabus) {
        var tabs = document.getElementById(level === 'primary' ? 'primary-tabs' : 'secondary-tabs');
        setActiveButton(tabs, '.tab-btn', function (button) {
            var onclick = button.getAttribute('onclick') || '';
            return onclick.indexOf("'" + syllabus + "'") >= 0 || onclick.indexOf('"' + syllabus + '"') >= 0;
        });
    }

    function activateSyllabusContent(syllabus) {
        document.querySelectorAll('.syllabus-content').forEach(function (content) {
            content.classList.toggle('active', content.id === syllabus);
        });
    }

    function activateLayer(syllabus, layer) {
        var syllabusContainer = document.getElementById(syllabus);
        if (!syllabusContainer) return false;

        var fallbackLayer = syllabus + '-subjects';
        var viewLayers = Array.prototype.slice.call(syllabusContainer.querySelectorAll('.view-layer'));
        var hasLayerInSyllabus = viewLayers.some(function (viewLayer) {
            return viewLayer.id === layer;
        });
        var targetId = hasLayerInSyllabus ? layer : fallbackLayer;

        viewLayers.forEach(function (viewLayer) {
            viewLayer.classList.toggle('active', viewLayer.id === targetId);
        });

        return true;
    }

    function applyRootRoute(route) {
        if (!route || !route.valid) return false;
        var level = route.level || getDefaultLevelForSyllabus(route.syllabus);

        setLevel(level);
        activateSyllabusTab(level, route.syllabus);
        activateSyllabusContent(route.syllabus);
        return activateLayer(route.syllabus, route.layer || (route.syllabus + '-subjects'));
    }

    function navigateRoot(level, syllabus, layer, options) {
        var routeHash = formatRoute(level || getDefaultLevelForSyllabus(syllabus), syllabus, layer);
        var navOptions = options || {};

        if (window.location.hash === routeHash) {
            applyRootRoute(parseRouteHash(routeHash));
            return;
        }

        if (navOptions.replace) {
            window.history.replaceState(null, document.title, routeHash);
            applyRootRoute(parseRouteHash(routeHash));
            return;
        }

        window.location.hash = routeHash;
    }

    function initRootNavigation() {
        var initialRoute = parseRouteHash(window.location.hash);
        if (initialRoute.valid) {
            applyRootRoute(initialRoute);
        }

        window.addEventListener('hashchange', function () {
            var route = parseRouteHash(window.location.hash);
            if (route.valid) applyRootRoute(route);
        });
    }

    window.Navigation = {
        parseRouteHash: parseRouteHash,
        formatRoute: formatRoute,
        isRootRouteHash: isRootRouteHash,
        withSourceContext: withSourceContext,
        getRelativeRootPrefix: getRelativeRootPrefix,
        buildReturnUrl: buildReturnUrl,
        applyRootRoute: applyRootRoute,
        navigateRoot: navigateRoot,
        initRootNavigation: initRootNavigation
    };
})();
