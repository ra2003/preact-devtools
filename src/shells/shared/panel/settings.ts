import { RawFilterState } from "../../../adapter/adapter/filter";
import { Store } from "../../../view/store/types";

/**
 * Load the theme from the browser private extension storage. This
 * storage is bound to the user profile and may be synced by the
 * browser.
 */
export async function loadSettings(window: Window, store: Store) {
	const doc = window.document;
	doc.body.classList.add((chrome.devtools.panels as any).themeName || "light");
	try {
		const settings: any = await new Promise(res => {
			chrome.storage.sync.get(
				[
					"theme",
					"captureRenderReasons",
					"debugMode",
					"highlightUpdates",
					"componentFilters",
					"experimentalFilters",
				],
				res,
			);
		});

		if (settings) {
			if (["light", "dark", "auto"].includes(settings.theme)) {
				store.theme.$ = settings.theme;
			}
			store.profiler.captureRenderReasons.$ = !!settings.captureRenderReasons;
			store.profiler.highlightUpdates.$ = !!settings.highlightUpdates;
			store.debugMode.$ = !!settings.debugMode;
			store.filter.experimental.$ = !!settings.experimentalFilters;
			if (settings.componentFilters) {
				store.filter.restore(settings.componentFilters);
			}
		}
	} catch (e) {
		// We don't really care if we couldn't load the settings
		// eslint-disable-next-line no-console
		console.error(e);
	}
}

export function storeFilters(state: RawFilterState) {
	store({ componentFilters: state });
}

// eslint-disable-next-line @typescript-eslint/ban-types
function store(obj: object) {
	try {
		chrome.storage.sync.set(obj);
	} catch (e) {
		// Storing the settings is not a critical operation, so we'll
		// just log the error and continue
		// eslint-disable-next-line no-console
		console.error(e);
	}
}

/**
 * Save theme into user storage (bound to user profile).
 */
export function storeTheme(theme: string) {
	store({ theme });
}

/**
 * Save render reason capturing into user storage (bound to user profile).
 */
export function storeCaptureRenderReasons(enabled: boolean) {
	store({ captureRenderReasons: enabled });
}

/**
 * Enables some additional debug views that's useful when
 * working on this extension.
 */
export function storeDebugMode(enabled: boolean) {
	store({ debugMode: enabled });
}

/**
 * Enables experimental filters
 */
export function storeExperimentalFilters(enabled: boolean) {
	store({ experimentalFilters: enabled });
}

/**
 * Visualize updates on the page.
 */
export function storeHighlightUpdates(enabled: boolean) {
	store({ highlightUpdates: enabled });
}
