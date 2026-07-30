import { fakeCourses, fakeStudyPlan } from "./fake-data/courses";
import { fakeEditions } from "./fake-data/editions";
import {
  fakeBenefits,
  fakeCategories,
  fakeProducts,
} from "./fake-data/products";
import { fakeProfessors } from "./fake-data/professors";

export async function CoursesWorkflow() {
  console.log("  👨‍🏫 Seeding professors...");
  const professors = await fakeProfessors();

  console.log("  🏷️  Seeding categories...");
  const categories = await fakeCategories();

  console.log("  🎁  Seeding benefits...");
  const benefits = await fakeBenefits();

  console.log("  📚  Seeding courses...");
  const courses = await fakeCourses();

  console.log("  📋  Seeding study plan for Lectura de Planos...");
  await fakeStudyPlan(courses[0].id);

  console.log("  🗓️  Seeding editions...");
  const editions = await fakeEditions(courses, professors);

  console.log("  🛍️  Seeding products...");
  const products = await fakeProducts(editions, categories, benefits);

  console.log(`  ✅  Done. Created:`);
  console.log(`      - ${professors.length} professors`);
  console.log(`      - ${categories.length} categories`);
  console.log(`      - ${benefits.length} benefits`);
  console.log(`      - ${courses.length} courses`);
  console.log(`      - ${editions.length} editions`);
  console.log(`      - ${products.length} products`);

  return { professors, categories, benefits, courses, editions, products };
}
