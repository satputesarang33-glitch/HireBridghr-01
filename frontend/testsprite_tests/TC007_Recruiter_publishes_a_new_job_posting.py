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
        
        # -> Open the 'Sign In' page (go to /signin) so the login form can be inspected.
        await page.goto("http://localhost:3000/signin")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'RECRUITER' quick demo login button and then click the 'Sign In' button to log in as a recruiter.
        # RECRUITER Elena button
        elem = page.get_by_role("button", name="RECRUITER Elena")
        await elem.click(timeout=10000)
        
        # -> Click the 'RECRUITER' quick demo login button and then click the 'Sign In' button to log in as a recruiter.
        # Sign In button
        elem = page.get_by_role("button", name="Sign In")
        await elem.click(timeout=10000)
        
        # -> Click the 'Jobs' link in the left sidebar to open the Jobs page.
        # Jobs link
        elem = page.get_by_role("link", name="Jobs")
        await elem.click(timeout=10000)
        
        # -> Click the 'Create New Job' button to open the job creation form.
        # Create New Job button
        elem = page.get_by_role("button", name="Create New Job")
        await elem.click(timeout=10000)
        
        # -> Fill the 'JOB TITLE' field with a unique title and click the 'Next: Description & Skills' button.
        # e.g. Senior Full Stack Engineer text field
        elem = page.get_by_role("textbox", name="Job Title")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Automated QA Test Requisition 2026-09-22")
        
        # -> Fill the 'JOB TITLE' field with a unique title and click the 'Next: Description & Skills' button.
        # Next: Description & Skills button
        elem = page.get_by_role("button", name="Next: Description & Skills")
        await elem.click(timeout=10000)
        
        # -> Click the 'Next: Compensation Details' button to open the Compensation Details step.
        # Next: Compensation Details button
        elem = page.get_by_role("button", name="Next: Compensation Details")
        await elem.click(timeout=10000)
        
        # -> Click the 'Next: Application Settings' button to proceed to Step 4 of the Create Job Requisition flow.
        # Next: Application Settings button
        elem = page.get_by_role("button", name="Next: Application Settings")
        await elem.click(timeout=10000)
        
        # -> Click the 'Review Live Job Preview' button to open the live preview and locate the final Publish control.
        # Review Live Job Preview button
        elem = page.get_by_role("button", name="Review Live Job Preview")
        await elem.click(timeout=10000)
        
        # -> Click the 'Submit for Publication Request' button to publish the requisition.
        # Submit for Publication Request button
        elem = page.get_by_role("button", name="Submit for Publication Request")
        await elem.click(timeout=10000)
        
        # -> Open the 'Automated QA Test Requisition 2026-09-22' job from the Jobs list to confirm its details page shows the status 'Published'.
        # Automated QA Test Requisition 2026-09-22 link
        elem = page.get_by_role("link", name="Automated QA Test Requisition")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The created job 'Automated QA Test Requisition 2026-09-22' is live: its job page shows the title and an 'Apply Now' button, and the Jobs list status was observed as 'Published'.
        # Assert-outcome: passed
        # Assert: Job detail page contains the created job title.
        await expect(page.get_by_role("main").nth(0)).to_contain_text("Automated QA Test Requisition 2026-09-22", timeout=15000), "Job detail page contains the created job title."
        await page.get_by_role("button", name="Apply Now →").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The 'Apply Now' button is visible on the public job page, indicating the posting is live.
        await expect(page.get_by_role("button", name="Apply Now →").nth(0)).to_be_visible(timeout=15000), "The 'Apply Now' button is visible on the public job page, indicating the posting is live."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    