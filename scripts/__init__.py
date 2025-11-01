# This script recursively searches for all companies in the yc json file and stores the company details in the Hyperspell index
# This index will then be used to search for companies by name or yc company details link

import os
import time

from dotenv import load_dotenv
from hyperspell import Hyperspell

load_dotenv()

client = Hyperspell(api_key=os.getenv("HYPERSPELL_API_KEY"), user_id="startup-reviver")


# for each year from 2010 to 2025, fetch the json file of companies
# for each company, add the company details to the Hyperspell index
# name of the collection: yc_companies
# title: name of the company
# details: company details

# sub categories: winter, spring, summer, fall, unspecified

# load data from json
import requests

response = requests.get("https://yc-oss.github.io/api/meta.json")
meta_data = response.json()
batches = meta_data.get("batches", [])

if not batches:
    print("No batches found in the meta data")
    exit(1)

sub_categories = ["winter", "spring", "summer", "fall", "unspecified"]

total_companies = 0
total_successful_adds = 0
total_failed_adds = 0

for year in range(2010, 2025):
    for sub_category in sub_categories:
        key = f"{sub_category}-{year}"
        # fetch batch data from json
        if key not in batches:
            print(f"No batch data found for {key}")
            continue

        print(f"\n{'='*60}")
        print(f"Processing batch: {key}")
        print(f"{'='*60}")

        batch_successful = 0
        batch_failed = 0

        batch_data = batches[key]

        # Check if 'api' key exists explicitly - skip if it doesn't
        if "api" not in batch_data:
            print(f"Skipping {key}: No 'api' key found")
            continue

        companies_url = batch_data["api"]

        if not isinstance(companies_url, str) or not companies_url.startswith("http"):
            print(f"Skipping {key}: Invalid API URL")
            continue

        # Add error handling for API calls
        try:
            print(f"Fetching companies from: {companies_url}")
            response = requests.get(companies_url, timeout=30)  # Add timeout
            response.raise_for_status()  # Raise exception for bad status codes
            companies_data = response.json()
            print(f"Found {len(companies_data)} companies in {key}")
        except (requests.RequestException, ValueError) as e:
            print(f"Error fetching companies from {companies_url}: {e}")
            continue

        for idx, company in enumerate(companies_data, 1):
            # Skip companies without a 'name' key
            if "name" not in company or not company.get("name"):
                continue

            company_name = company["name"]
            total_companies += 1

            company_details = "; ".join([f"{k}: {v}" for k, v in company.items()])

            print(
                f"\n[{total_companies}] Processing: {company_name} ({idx}/{len(companies_data)} in {key})"
            )

            # Add error handling for memory add operation with timeout
            try:
                client.memories.add(
                    title=company_name,
                    collection="yc_companies",
                    extra_body=company,
                    text=company_details,
                    timeout=60,  # 60 second timeout for API call
                )
                total_successful_adds += 1
                batch_successful += 1
                print(f"✓ Successfully added: {company_name}")
            except Exception as e:
                total_failed_adds += 1
                batch_failed += 1
                print(f"✗ Error adding company {company_name}: {e}")
                continue

            # Rate limiting: small delay between requests to avoid hitting rate limits
            time.sleep(0.5)  # 500ms delay between requests

        print(
            f"\nCompleted batch {key}: {batch_successful} successful, {batch_failed} failed"
        )

print(f"\n{'='*60}")
print(f"SCRIPT COMPLETED")
print(f"{'='*60}")
print(f"Total companies processed: {total_companies}")
print(f"Successfully added: {total_successful_adds}")
print(f"Failed: {total_failed_adds}")
print(f"{'='*60}\n")
