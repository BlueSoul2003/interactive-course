(function () {
    'use strict';

    var VALID_LEVELS = new Set(['secondary', 'primary']);
    var VALID_SYLLABUSES = new Set(['spm', 'uec', 'igcse', 'sg', 'kssr']);
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

        if (parts.length < 2 || !VALID_LEVELS.has(level) || !VALID_SYLLABUSES.has(syllabus)) {
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
        var foldersAfterFaculty = Math.max(parts.length - universityIndex - 3, 0);
        var prefixToUniversity = '../'.repeat(foldersAfterFaculty + 1);

        if (faculty.toLowerCase() === 'physics') {
            return prefixToUniversity + 'physics-hub.html';
        }

        return prefixToUniversity + 'index.html';
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

    window.Navigation = {
        parseRouteHash: parseRouteHash,
        formatRoute: formatRoute,
        isRootRouteHash: isRootRouteHash,
        withSourceContext: withSourceContext,
        getRelativeRootPrefix: getRelativeRootPrefix,
        buildReturnUrl: buildReturnUrl
    };
})();
