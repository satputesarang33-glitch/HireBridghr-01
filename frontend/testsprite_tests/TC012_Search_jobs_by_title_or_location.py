import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Sign In' link in the header to open the candidate login page.
        # Sign In link
        elem = page.get_by_role("link", name="Sign In")
        await elem.click(timeout=10000)
        
        # -> Click the 'Sign in as Candidate →' link to open the candidate login page.
        # Sign in as Candidate → link
        elem = page.get_by_role("link", name="Sign in as Candidate →")
        await elem.click(timeout=10000)
        
        # -> Click the 'Alex Rivera' Quick Demo candidate button to fill credentials, then click the 'Sign In' button to submit the form.
        # Alex Rivera alex.candidate@example.com Click to... button
        elem = page.get_by_role("button", name="Alex Rivera alex.candidate@")
        await elem.click(timeout=10000)
        
        # -> Click the 'Alex Rivera' Quick Demo candidate button to fill credentials, then click the 'Sign In' button to submit the form.
        # Sign In button
        elem = page.get_by_role("button", name="Sign In")
        await elem.click(timeout=10000)
        
        # -> Click the sidebar link labeled "Find Jobs" to open the candidate jobs/search page.
        # Find Jobs link
        elem = page.get_by_role("link", name="Find Jobs")
        await elem.click(timeout=10000)
        
        # -> Enter 'DevOps' into the 'Search by job title, skills (React, Node, Cloud), company, or location...' field and press Enter to submit the search.
        # Search by job title, skills (React, Node, Cloud)... text field
        elem = page.get_by_role("textbox", name="Search by job title, skills (")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("DevOps")
        
        # --> Assertions to verify final state
        
        # --> The job search input contains the entered term 'DevOps'.
        # Assert-outcome: passed
        # Assert: Search field contains the entered term 'DevOps'.
        await expect(page.get_by_role("textbox", name="Search by job title, skills (").nth(0)).to_have_value("DevOps", timeout=15000), "Search field contains the entered term 'DevOps'."
        
        # --> A matching job card titled 'Lead DevOps & Cloud Architect' is visible in the results.
        # Assert-outcome: passed
        # Assert: A job card with the title 'Lead DevOps & Cloud Architect' is displayed.
        await expect(page.locator("h3").nth(0)).to_have_text("Lead DevOps & Cloud Architect", timeout=15000), "A job card with the title 'Lead DevOps & Cloud Architect' is displayed."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    