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
        
        # -> Click the 'Sign In' link in the top navigation to open the sign-in page.
        # Sign In link
        elem = page.get_by_role("link", name="Sign In")
        await elem.click(timeout=10000)
        
        # -> Click the 'RECRUITER — Elena' quick demo login button, then click the 'Sign In' button to authenticate as a recruiter.
        # RECRUITER Elena button
        elem = page.get_by_role("button", name="RECRUITER Elena")
        await elem.click(timeout=10000)
        
        # -> Click the 'RECRUITER — Elena' quick demo login button, then click the 'Sign In' button to authenticate as a recruiter.
        # Sign In button
        elem = page.get_by_role("button", name="Sign In")
        await elem.click(timeout=10000)
        
        # -> Click the 'Jobs' link in the left navigation to open the Jobs page.
        # Jobs link
        elem = page.get_by_role("link", name="Jobs")
        await elem.click(timeout=10000)
        
        # -> Click the 'Create Job' button (label: Create Job) to open the new job creation form.
        # Create Job button
        elem = page.get_by_role("button", name="Create Job")
        await elem.click(timeout=10000)
        
        # -> Fill the 'Job Title' field with a unique title and click the 'Next: Description & Skills' button
        # e.g. Senior Full Stack Engineer text field
        elem = page.get_by_role("textbox", name="Job Title")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("QA Test Job - Recruiter Draft 2026-09-22")
        
        # -> Fill the 'Job Title' field with a unique title and click the 'Next: Description & Skills' button
        # Next: Description & Skills button
        elem = page.get_by_role("button", name="Next: Description & Skills")
        await elem.click(timeout=10000)
        
        # -> Click the 'Next: Compensation Details' button to open the Compensation Details step.
        # Next: Compensation Details button
        elem = page.get_by_role("button", name="Next: Compensation Details")
        await elem.click(timeout=10000)
        
        # -> Click the 'Next: Application Settings' button to proceed to the application settings step.
        # Next: Application Settings button
        elem = page.get_by_role("button", name="Next: Application Settings")
        await elem.click(timeout=10000)
        
        # -> Click the 'Review Live Job Preview' button to open the job preview and locate the Save as Draft control.
        # Review Live Job Preview button
        elem = page.get_by_role("button", name="Review Live Job Preview")
        await elem.click(timeout=10000)
        
        # -> Click the 'Save as Draft' button in the Live Applicant Preview to save the requisition as a draft.
        # Save as Draft button
        elem = page.get_by_role("button", name="Save as Draft")
        await elem.click(timeout=10000)
        
        # -> Click the job title 'QA Test Job - Recruiter Draft 2026-09-22' to open its details and confirm the requisition status shows 'Draft'.
        # QA Test Job - Recruiter Draft 2026-09-22 link
        elem = page.get_by_role("link", name="QA Test Job - Recruiter Draft")
        await elem.click(timeout=10000)
        
        # -> Open the 'Jobs' page, find the 'QA Test Job - Recruiter Draft 2026-09-22' row, and confirm its status shows 'Draft'.
        await page.goto("http://localhost:3000/jobs")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> The newly created job 'QA Test Job - Recruiter Draft 2026-09-22' appears in the Jobs list.
        # Assert-outcome: passed
        # Assert: Verify the job title is present in the jobs table.
        await expect(page.locator("xpath=/html/body/div/div[1]/div[3]/main/div/div[3]/table/tbody/tr[1]/td[1]/a").nth(0)).to_have_text("QA Test Job - Recruiter Draft 2026-09-22", timeout=15000), "Verify the job title is present in the jobs table."
        
        # --> The job's Status column shows 'Draft'.
        # Assert-outcome: passed
        # Assert: Verify the job row's status text is 'Draft'.
        await expect(page.locator("xpath=/html/body/div/div[1]/div[3]/main/div/div[3]/table/tbody/tr[1]/td[6]").nth(0)).to_have_text("Draft", timeout=15000), "Verify the job row's status text is 'Draft'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    